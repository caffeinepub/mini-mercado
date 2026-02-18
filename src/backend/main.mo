import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  // type constants
  let floatCurrencyDecimals = Int.fromNat(2);
  let raffleThresholdCents = 5000; // 50.00 with 2 decimals
  type ValidatedPriceRange = {
    #aboveZero;
    #zeroValue;
    #negative;
  };

  public type PaymentMethod = {
    #pix;
    #debito;
    #credito;
  };

  // backend types
  type Customer = {
    id : Text;
    name : Text;
    phone : Text;
    totalPurchasesCents : Int;
    eligibleForRaffle : Bool;
  };

  type CreateCustomerRequest = {
    id : Text;
    name : Text;
    phone : Text;
  };

  type UpdateCustomerRequest = {
    id : Text;
    name : Text;
    phone : Text;
  };

  type Item = {
    id : Text;
    name : Text;
    blob : Storage.ExternalBlob;
    priceCents : Int;
  };

  type SaleItem = {
    itemId : Text;
    name : Text;
    quantity : Nat;
    priceCents : Int;
    totalCents : Int;
  };

  type Sale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : PaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Time.Time;
  };

  type CashRegisterSession = {
    id : Nat;
    initialFloatCents : Int;
    openTime : Time.Time;
    closeTime : ?Time.Time;
    finalBalanceCents : ?Int;
    isOpen : Bool;
  };

  type ClosingRecord = {
    id : Nat;
    sessionId : Nat;
    closeTime : Time.Time;
    finalBalanceCents : Int;
  };

  type OpenRegisterRequest = {
    initialFloatCents : Int;
  };

  type CloseRegisterRequest = {
    sessionId : Nat;
    finalBalanceCents : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  // State variables
  var nextSaleId = 1;
  var nextRegisterSessionId = 1;
  let customers = Map.empty<Text, Customer>();
  let sales = Map.empty<Nat, Sale>();
  let items = Map.empty<Text, Item>();
  let registerSessions = Map.empty<Nat, CashRegisterSession>();
  let closings = Map.empty<Nat, ClosingRecord>();
  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // USER PROFILE METHODS

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // CUSTOMER MANAGEMENT METHODS

  public shared ({ caller }) func createCustomer(request : CreateCustomerRequest) : async Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create customers");
    };

    // Check if customer already exists
    switch (customers.get(request.id)) {
      case (?_) { Runtime.trap("Customer with this ID already exists") };
      case (null) {
        let customer : Customer = {
          id = request.id;
          name = request.name;
          phone = request.phone;
          totalPurchasesCents = 0;
          eligibleForRaffle = false;
        };
        customers.add(request.id, customer);
        customer;
      };
    };
  };

  public query ({ caller }) func getCustomer(id : Text) : async Customer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) { customer };
    };
  };

  public shared ({ caller }) func updateCustomer(request : UpdateCustomerRequest) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };
    switch (customers.get(request.id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        let updatedCustomer : Customer = {
          customer with
          name = request.name;
          phone = request.phone;
        };
        customers.add(request.id, updatedCustomer);
      };
    };
  };

  public query ({ caller }) func listCustomers() : async [Customer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list customers");
    };
    customers.values().toArray();
  };

  // SALES RELATED METHODS

  public query ({ caller }) func getSale(id : Nat) : async ?Sale {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };
    sales.get(id);
  };

  public query ({ caller }) func listSales() : async [Sale] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list sales");
    };
    sales.values().toArray();
  };

  public query ({ caller }) func listSalesByCustomer(customerId : Text) : async [Sale] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view sales history");
    };
    sales.values().filter(func(sale : Sale) : Bool {
      switch (sale.customerId) {
        case (?id) { id == customerId };
        case (null) { false };
      };
    }).toArray();
  };

  public shared ({ caller }) func recordSale(
    customerId : ?Text,
    items : [SaleItem],
    paymentMethod : PaymentMethod,
    amountPaidCents : Int,
  ) : async Sale {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record sales");
    };

    // Validate that customer exists if provided
    switch (customerId) {
      case (?id) {
        switch (customers.get(id)) {
          case (null) { Runtime.trap("Customer not found") };
          case (?_) { () };
        };
      };
      case (null) { () };
    };

    // Validate items array is not empty
    if (items.size() == 0) {
      Runtime.trap("Cannot record sale with no items");
    };

    // Validate payment method and amount paid
    switch (paymentMethod) {
      case (#pix) { () };
      case (#debito) { () };
      case (#credito) { () };
    };

    let totalCents = items.foldLeft(
      0,
      func(acc, item) {
        acc + item.totalCents.toNat();
      },
    );

    // Validate total is positive
    if (totalCents <= 0) {
      Runtime.trap("Sale total must be positive");
    };

    let sale : Sale = {
      id = nextSaleId;
      customerId;
      items;
      paymentMethod;
      totalCents;
      changeCents = 0;
      date = Time.now();
    };

    sales.add(nextSaleId, sale);
    nextSaleId += 1;

    // Update customer purchases and eligibility if customer exists
    switch (customerId) {
      case (?id) {
        switch (customers.get(id)) {
          case (?customer) {
            let updatedTotal = customer.totalPurchasesCents + totalCents;
            let eligibleForRaffle = updatedTotal >= raffleThresholdCents;
            let updatedCustomer : Customer = {
              customer with
              totalPurchasesCents = updatedTotal;
              eligibleForRaffle;
            };
            customers.add(id, updatedCustomer);
          };
          case (null) { Runtime.trap("Customer not found") };
        };
      };
      case (null) { () };
    };

    sale;
  };

  // ADMIN-ONLY: Delete specific sale entry from history
  public shared ({ caller }) func deleteSale(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manually delete sales history");
    };
    switch (sales.get(id)) {
      case (null) { () };
      case (?_) {
        sales.remove(id);
      };
    };
  };

  // CASH REGISTER METHODS

  public shared ({ caller }) func openRegister(request : OpenRegisterRequest) : async CashRegisterSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can open cash register");
    };
    switch (validatePriceRange(request.initialFloatCents)) {
      case (#aboveZero) { () };
      case (#zeroValue) { Runtime.trap("Cannot open with zero value") };
      case (#negative) { Runtime.trap("Cannot be negative") };
    };

    let session : CashRegisterSession = {
      id = nextRegisterSessionId;
      initialFloatCents = request.initialFloatCents;
      openTime = Time.now();
      closeTime = null;
      finalBalanceCents = null;
      isOpen = true;
    };

    registerSessions.add(nextRegisterSessionId, session);
    nextRegisterSessionId += 1;

    session;
  };

  public shared ({ caller }) func closeRegister(request : CloseRegisterRequest) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can close cash register");
    };
    switch (validatePriceRange(request.finalBalanceCents)) {
      case (#aboveZero) { () };
      case (#zeroValue) { Runtime.trap("Cannot close with zero value") };
      case (#negative) { Runtime.trap("Cannot be negative") };
    };

    switch (registerSessions.get(request.sessionId)) {
      case (null) { Runtime.trap("Register session not found") };
      case (?session) {
        if (not session.isOpen) {
          Runtime.trap("Register session is already closed");
        };

        let closingRecord : ClosingRecord = {
          id = request.sessionId;
          sessionId = request.sessionId;
          closeTime = Time.now();
          finalBalanceCents = request.finalBalanceCents;
        };

        closings.add(request.sessionId, closingRecord);
        let updatedSession : CashRegisterSession = {
          session with
          closeTime = ?Time.now();
          finalBalanceCents = ?request.finalBalanceCents;
          isOpen = false;
        };
        registerSessions.add(request.sessionId, updatedSession);
      };
    };
  };

  public query ({ caller }) func listRegisterSessions() : async [CashRegisterSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view register sessions");
    };
    registerSessions.values().toArray();
  };

  public query ({ caller }) func listClosingRecords() : async [ClosingRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view closing records");
    };
    closings.values().toArray();
  };

  public query ({ caller }) func getOpenRegisterSession() : async ?CashRegisterSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view register sessions");
    };
    registerSessions.values().find(func(session : CashRegisterSession) : Bool {
      session.isOpen;
    });
  };

  // Helper function to validate price range (internal only)
  func validatePriceRange(amountCents : Int) : ValidatedPriceRange {
    if (amountCents < 0) {
      #negative;
    } else if (amountCents == 0) {
      #zeroValue;
    } else {
      #aboveZero;
    };
  };
};
