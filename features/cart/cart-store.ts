'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item => {
        const qty = item.quantity ?? 1;
        const existing = get().items.find(i => i.productId === item.productId);
        set({
          items: existing
            ? get().items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              )
            : [...get().items, { ...item, quantity: qty }],
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },
      removeItem: productId => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },
    }),
    { name: 'commerce-cart' },
  ),
);

export function useCart() {
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, addItem, updateQuantity, removeItem, count };
}
