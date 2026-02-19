import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  // Old type constants
  type ValidatedPriceRange = {
    #aboveZero;
    #zeroValue;
    #negative;
  };

  type OldPaymentMethod = {
    #pix;
    #debito;
    #credito;
  };

  // Old backend types
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
    paymentMethod : OldPaymentMethod;
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

  type UserProfile = {
    name : Text;
  };

  type OldState = {
    floatCurrencyDecimals : Int;
    raffleThresholdCents : Int;
    nextSaleId : Nat;
    nextRegisterSessionId : Nat;
    customers : Map.Map<Text, Customer>;
    sales : Map.Map<Nat, Sale>;
    items : Map.Map<Text, Item>;
    registerSessions : Map.Map<Nat, CashRegisterSession>;
    closings : Map.Map<Nat, ClosingRecord>;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewPaymentMethod = {
    #pix;
    #debito;
    #credito;
    #dinheiro;
  };

  type NewSale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : NewPaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Time.Time;
  };

  type NewState = {
    nextSaleId : Nat;
    nextRegisterSessionId : Nat;
    customers : Map.Map<Text, Customer>;
    sales : Map.Map<Nat, NewSale>;
    items : Map.Map<Text, Item>;
    registerSessions : Map.Map<Nat, CashRegisterSession>;
    closings : Map.Map<Nat, ClosingRecord>;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldState) : NewState {
    let newSales = old.sales.map<Nat, Sale, NewSale>(
      func(_id, oldSale) {
        { oldSale with paymentMethod = convertPaymentMethod(oldSale.paymentMethod) };
      }
    );
    {
      nextSaleId = old.nextSaleId;
      nextRegisterSessionId = old.nextRegisterSessionId;
      customers = old.customers;
      sales = newSales;
      items = old.items;
      registerSessions = old.registerSessions;
      closings = old.closings;
      accessControlState = old.accessControlState;
      userProfiles = old.userProfiles;
    };
  };

  func convertPaymentMethod(oldMethod : OldPaymentMethod) : NewPaymentMethod {
    switch (oldMethod) {
      case (#pix) { #pix };
      case (#debito) { #debito };
      case (#credito) { #credito };
    };
  };
};
