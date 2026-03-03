import { useState, useEffect, useCallback } from 'react';
import type { CompareItem } from '../types/database';

const STORAGE_KEY = 'pricewise_compare';
const MAX_COMPARE_ITEMS = 4;

function loadFromStorage(): CompareItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_COMPARE_ITEMS);
  } catch {
    return [];
  }
}

function saveToStorage(items: CompareItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function useCompare() {
  const [items, setItems] = useState<CompareItem[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addItem = useCallback((productId: string, locationId?: string) => {
    setItems(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some(item => item.productId === productId && item.locationId === locationId)) {
        return prev;
      }
      return [...prev, { productId, locationId }];
    });
  }, []);

  const removeItem = useCallback((productId: string, locationId?: string) => {
    setItems(prev =>
      prev.filter(item => !(item.productId === productId && item.locationId === locationId))
    );
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isInCompare = useCallback((productId: string, locationId?: string) => {
    return items.some(item => item.productId === productId && item.locationId === locationId);
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    clearAll,
    isInCompare,
    count: items.length,
    isFull: items.length >= MAX_COMPARE_ITEMS,
  };
}
