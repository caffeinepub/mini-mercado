# Specification

## Summary
**Goal:** Localize all user-facing UI text across the application to Portuguese (pt-BR), including dynamic, validation, and confirmation messaging, while preserving stored/internal values.

**Planned changes:**
- Translate all visible UI strings to pt-BR across key screens (Dashboard, Inventory, POS, Customers, Cash Register), including navigation/header labels, page titles, headings, buttons, placeholders, helper text, alerts, and empty states.
- Translate dynamic and validation/error messaging to pt-BR, including delete confirmation prompts, purchase-history deletion errors, POS checkout validation errors, and cash-register warnings/alerts.
- Localize payment-method labels and raffle-eligibility messaging to pt-BR via display mappings so existing persisted/internal PaymentMethod values and stored sale records remain unchanged.

**User-visible outcome:** The entire app UI (including confirmations and validation messages) displays in Portuguese (pt-BR), with payment methods shown in pt-BR without impacting existing saved data.
