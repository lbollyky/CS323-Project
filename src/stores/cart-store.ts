import { create } from "zustand";
import type { Product } from "@/types/database";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setItems: (products: Product[]) => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  clearCart: () => set({ items: [] }),

  setItems: (products) =>
    set({
      items: products.map((product) => ({ product, quantity: 1 })),
    }),

  total: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
}));
