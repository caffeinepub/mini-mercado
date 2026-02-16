# Specification

## Summary
**Goal:** Add a Sales History screen to review all recorded sales, including expandable item-by-item details.

**Planned changes:**
- Create a new Sales History page component reachable from the app UI.
- Fetch and render sales data using the existing React Query hook `useListSales()` (no mocked/local data), including loading and empty states.
- Display key sale fields per entry (formatted timestamp, customer, total, payment method, and cash change when applicable) and allow expanding each sale to view line items (product name, quantity, unit price/subtotal).
- Add navigation entry from the Dashboard to Sales History.
- Update `frontend/src/App.tsx` page-switching logic to include the new Sales History page key and render it correctly.
- Add minimal new `ptBR` i18n labels for Sales History navigation and headings, reusing existing formatting/helpers where applicable.

**User-visible outcome:** Users can open a new Sales History screen from the Dashboard to view a list of past sales, expand any sale to see item details, and return to the Dashboard using the existing header navigation.
