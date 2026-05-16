'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image_url: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (item: Omit<CartLine, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  // selectors
  itemCount: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.id === item.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.id === item.id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...item, qty }] };
        }),

      remove: (id) =>
        set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),

      setQty: (id, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.id !== id)
              : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),

      clear: () => set({ lines: [] }),

      itemCount: () => get().lines.reduce((n, l) => n + l.qty, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.qty * l.price, 0),
    }),
    {
      name: 'cafe-verde-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
