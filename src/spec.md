# Specification

## Summary
**Goal:** Enable users to cancel and edit completed sales with automatic stock restoration and audit tracking.

**Planned changes:**
- Add sale status tracking (active/cancelled) to backend
- Implement sale cancellation that restores product stock
- Allow editing payment method and item quantities with proportional stock adjustments
- Create audit log system to track all sale modifications
- Add Cancel and Edit buttons to sales history UI
- Implement filters to view active, cancelled, or all sales separately
- Exclude cancelled sales from financial reports and totals

**User-visible outcome:** Users can cancel mistaken sales (restoring stock automatically), edit payment methods and quantities on existing sales, and filter the sales history to view active or cancelled transactions separately. All changes are tracked in an audit log.
