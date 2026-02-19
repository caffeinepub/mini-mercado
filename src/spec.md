# Specification

## Summary
**Goal:** Add cash payment option with automatic change calculation to the checkout flow.

**Planned changes:**
- Add 'dinheiro' (cash) as a fourth payment method in backend alongside pix, debito, and credito
- Update frontend to support 'cash' payment method with Portuguese label 'Dinheiro'
- Add cash payment button to CheckoutPanel
- Implement change calculation interface that shows when cash is selected, with input for amount tendered and automatic change calculation
- Update cash register reporting to include cash payment totals in breakdown
- Update sales history to display cash payment method

**User-visible outcome:** Users can select cash as a payment method during checkout, enter the amount tendered, see the calculated change due, and view cash payments in sales history and cash register reports.
