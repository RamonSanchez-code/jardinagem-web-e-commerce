"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomConfig } from "@/db/schema";

export type CartItem = {
  id: string;
  kind: "produto" | "personalizado";
  productId?: number;
  slug?: string;
  name: string;
  image: string;
  unitPriceCents: number;
  qty: number;
  meta?: string;
  lines?: string[];
  custom?: CustomConfig;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty" | "id"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

function keyOf(i: Omit<CartItem, "qty" | "id">): string {
  return i.kind === "produto"
    ? `p-${i.productId}-${i.meta ?? ""}`
    : `c-${i.custom?.potId}-${i.custom?.potColor}-${i.custom?.sizeId}-${(i.custom?.materials ?? [])
        .map((m) => `${m.id}x${m.qty}`)
        .join(".")}-${(i.custom?.plants ?? []).map((p) => p.id).join(".")}-${i.custom?.flowerColor ?? ""}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const key = keyOf(item);
          const existing = state.items.find((i) => i.id === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === key ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, id: key, qty: item.qty ?? 1 }],
          };
        }),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "np-cart" }
  )
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.qty, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.qty * i.unitPriceCents, 0);
