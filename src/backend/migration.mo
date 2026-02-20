import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  public type PaymentMethod = {
    #pix;
    #debito;
    #credito;
    #dinheiro;
  };

  public type SaleStatus = {
    #active;
    #cancelled;
  };

  type SaleItem = {
    itemId : Text;
    name : Text;
    quantity : Nat;
    priceCents : Int;
    totalCents : Int;
  };

  // Old Sale record (without status)
  type OldSale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : PaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Time.Time;
  };

  // New Sale record (with status)
  type NewSale = {
    id : Nat;
    customerId : ?Text;
    items : [SaleItem];
    paymentMethod : PaymentMethod;
    totalCents : Int;
    changeCents : Int;
    date : Time.Time;
    status : SaleStatus;
  };

  // Old actor with sales map
  type OldActor = {
    nextSaleId : Nat;
    sales : Map.Map<Nat, OldSale>;
  };

  // New actor with sales map using NewSale type
  type NewActor = {
    nextSaleId : Nat;
    sales : Map.Map<Nat, NewSale>;
  };

  public func run(old : OldActor) : NewActor {
    let newSales = old.sales.map<Nat, OldSale, NewSale>(
      func(_id, oldSale) {
        { oldSale with status = #active };
      }
    );
    { old with sales = newSales };
  };
};
