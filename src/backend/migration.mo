import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";

module {
  type OldPaymentMethod = {
    #cash;
    #card;
  };

  type OldSale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : OldPaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Int;
  };

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
    blob : Blob;
    priceCents : Int;
  };

  type SaleItem = {
    itemId : Text;
    name : Text;
    quantity : Nat;
    priceCents : Int;
    totalCents : Int;
  };

  type CashRegisterSession = {
    id : Nat;
    initialFloatCents : Int;
    openTime : Int;
    closeTime : ?Int;
    finalBalanceCents : ?Int;
    isOpen : Bool;
  };

  type ClosingRecord = {
    id : Nat;
    sessionId : Nat;
    closeTime : Int;
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

  type OldActor = {
    nextSaleId : Nat;
    nextRegisterSessionId : Nat;
    customers : Map.Map<Text, Customer>;
    sales : Map.Map<Nat, OldSale>;
    items : Map.Map<Text, Item>;
    registerSessions : Map.Map<Nat, CashRegisterSession>;
    closings : Map.Map<Nat, ClosingRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewPaymentMethod = {
    #pix;
    #debito;
    #credito;
  };

  type NewSale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : NewPaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Int;
  };

  type NewActor = {
    nextSaleId : Nat;
    nextRegisterSessionId : Nat;
    customers : Map.Map<Text, Customer>;
    sales : Map.Map<Nat, NewSale>;
    items : Map.Map<Text, Item>;
    registerSessions : Map.Map<Nat, CashRegisterSession>;
    closings : Map.Map<Nat, ClosingRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newSales = old.sales.map<Nat, OldSale, NewSale>(
      func(_id, oldSale) {
        {
          oldSale with paymentMethod = #pix;
        };
      }
    );
    { old with sales = newSales };
  };
};
