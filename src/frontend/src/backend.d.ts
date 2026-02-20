import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UpdateCustomerRequest {
    id: string;
    name: string;
    phone: string;
}
export interface OpenRegisterRequest {
    initialFloatCents: bigint;
}
export interface CreateCustomerRequest {
    id: string;
    name: string;
    phone: string;
}
export interface Sale {
    id: bigint;
    status: SaleStatus;
    paymentMethod: PaymentMethod;
    date: Time;
    totalCents: bigint;
    changeCents: bigint;
    customerId?: string;
    items: Array<SaleItem>;
}
export interface Customer {
    id: string;
    eligibleForRaffle: boolean;
    name: string;
    totalPurchasesCents: bigint;
    phone: string;
}
export interface ClosingRecord {
    id: bigint;
    closeTime: Time;
    sessionId: bigint;
    finalBalanceCents: bigint;
}
export interface CashRegisterSession {
    id: bigint;
    closeTime?: Time;
    isOpen: boolean;
    finalBalanceCents?: bigint;
    initialFloatCents: bigint;
    openTime: Time;
}
export interface SaleEditLog {
    id: bigint;
    action: Variant_edit_cancel;
    saleId: bigint;
    editor: Principal;
    newValue: Sale;
    previousValue: Sale;
    timestamp: Time;
}
export interface CloseRegisterRequest {
    sessionId: bigint;
    finalBalanceCents: bigint;
}
export interface SaleItem {
    itemId: string;
    name: string;
    totalCents: bigint;
    quantity: bigint;
    priceCents: bigint;
}
export interface UserProfile {
    name: string;
}
export enum PaymentMethod {
    pix = "pix",
    credito = "credito",
    debito = "debito",
    dinheiro = "dinheiro"
}
export enum SaleStatus {
    active = "active",
    cancelled = "cancelled"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_edit_cancel {
    edit = "edit",
    cancel = "cancel"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelSaleToday(saleId: bigint): Promise<boolean>;
    closeRegister(request: CloseRegisterRequest): Promise<void>;
    createCustomer(request: CreateCustomerRequest): Promise<Customer>;
    deleteSale(id: bigint): Promise<void>;
    editSaleToday(saleId: bigint, newPaymentMethod: PaymentMethod, newItems: Array<SaleItem>): Promise<boolean>;
    getActiveSales(): Promise<Array<Sale>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: string): Promise<Customer>;
    getOpenRegisterSession(): Promise<CashRegisterSession | null>;
    getSale(id: bigint): Promise<Sale | null>;
    getSaleEditLogsByEditor(editor: Principal): Promise<Array<SaleEditLog>>;
    getSaleEditLogsBySale(saleId: bigint): Promise<Array<SaleEditLog>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listClosingRecords(): Promise<Array<ClosingRecord>>;
    listCustomers(): Promise<Array<Customer>>;
    listRegisterSessions(): Promise<Array<CashRegisterSession>>;
    listSales(): Promise<Array<Sale>>;
    listSalesByCustomer(customerId: string): Promise<Array<Sale>>;
    openRegister(request: OpenRegisterRequest): Promise<CashRegisterSession>;
    recordSale(customerId: string | null, items: Array<SaleItem>, paymentMethod: PaymentMethod, amountPaidCents: bigint): Promise<Sale>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(request: UpdateCustomerRequest): Promise<void>;
}
