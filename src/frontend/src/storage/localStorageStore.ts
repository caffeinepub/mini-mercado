import type { AppState, Product, Customer, Sale, CashSession, CashCloseRecord } from '../types/domain';

const STORAGE_KEY = 'mini_market_app_state';
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  state: AppState;
}

const defaultState: AppState = {
  products: [],
  customers: [],
  sales: [],
  currentCashSession: undefined,
  cashCloseHistory: [],
};

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultState };

    const data: StorageData = JSON.parse(stored);
    
    // Version migration logic can go here
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, using defaults');
      return { ...defaultState };
    }

    return data.state;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return { ...defaultState };
  }
}

export function saveState(state: AppState): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
