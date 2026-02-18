// Local draft storage for POS sales to prevent data loss on page close/refresh

export interface DraftSale {
  customerId: string | null;
  customerSelection: 'none' | 'final-consumer' | 'customer';
  cartItems: Array<{
    productId: string;
    quantity: number;
  }>;
  timestamp: number;
}

const DRAFT_KEY = 'pos-draft-sale';

export function saveDraft(draft: DraftSale): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function loadDraft(): DraftSale | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    
    const draft = JSON.parse(stored) as DraftSale;
    
    // Discard drafts older than 24 hours
    const age = Date.now() - draft.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      clearDraft();
      return null;
    }
    
    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}
