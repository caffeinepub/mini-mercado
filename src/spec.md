# Specification

## Summary
**Goal:** Fix the payment method classification bug where Pix and Debit sales are incorrectly saved as Credit, and improve payment method visibility in reports and checkout.

**Planned changes:**
- Fix backend sale creation logic to correctly store payment method values (pix, debito, credito) without forcing all sales to 'credito'
- Update Sale data type schema to validate and store the three distinct payment methods without default overrides
- Fix payment method mapping in frontend mappers to ensure correct bidirectional conversion between frontend enum values (PIX, DEBIT, CREDIT) and backend strings (pix, debito, credito)
- Update sales report query logic to correctly group and aggregate sales by the three distinct payment methods, displaying separate totals for Pix, Debit, and Credit
- Add payment method confirmation display in the checkout summary showing "Payment: [Selected Method]" before completing the sale

**User-visible outcome:** Users will see accurate payment method classification in the cash register closing report with separate totals for Pix, Debit, and Credit. The checkout panel will display a clear confirmation of the selected payment method before completing sales.
