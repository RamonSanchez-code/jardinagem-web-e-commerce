"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";

type ItemInput = Omit<CartItem, "qty" | "id">;

export function AddToCartButton({
  item,
  qty = 1,
  compact = false,
  label = "Adicionar ao carrinho",
  disabled = false,
  className = "",
}: {
  item: ItemInput;
  qty?: number;
  compact?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add({ ...item, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
          added ? "bg-moss text-forest" : "bg-cream text-forest hover:bg-white"
        } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
        {added ? "Feito!" : "Comprar"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition ${
        added ? "bg-leaf text-white" : "bg-primary text-white hover:bg-forest"
      } disabled:cursor-not-allowed disabled:bg-sand disabled:text-stonegray ${className}`}
    >
      {added ? (
        <><Check className="h-4 w-4" /> Adicionado ao carrinho</>
      ) : (
        <><ShoppingBag className="h-4 w-4" /> {label}</>
      )}
    </button>
  );
}
