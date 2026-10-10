"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { compositions } from "@/db/schema";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";

type Composition = typeof compositions.$inferSelect;

export function CompositionCard({ composition }: { composition: Composition }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const cfg = composition.config;

  const onAdd = () => {
    add({
      kind: "personalizado",
      name: `Vaso personalizado — ${cfg.potName}`,
      image: "",
      unitPriceCents: composition.totalCents,
      custom: cfg,
      lines: [
        cfg.potName + (cfg.potColor ? ` — ${cfg.potColor}` : "") + (cfg.sizeLabel ? ` (${cfg.sizeLabel})` : ""),
        ...cfg.materials.map((m) => `${m.name} × ${m.qty}`),
        ...cfg.plants.map((p) => p.name),
      ],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-sand">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{composition.name}</h3>
          <p className="text-xs text-stonegray">
            {new Date(composition.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <p className="text-base font-bold text-forest">{brl(composition.totalCents)}</p>
      </div>
      <ul className="mt-3 flex-1 space-y-1 text-[0.78rem] text-ink/75">
        <li>· Vaso {cfg.potName}{cfg.potColor ? ` — ${cfg.potColor}` : ""}{cfg.sizeLabel ? ` (${cfg.sizeLabel})` : ""}</li>
        {cfg.materials.map((m) => <li key={m.id}>· {m.name} × {m.qty}</li>)}
        {cfg.plants.map((p) => <li key={p.id}>· {p.name}</li>)}
      </ul>
      <button
        onClick={onAdd}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold text-white transition ${added ? "bg-leaf" : "bg-primary hover:bg-forest"}`}
      >
        {added ? <><Check className="h-3.5 w-3.5" /> Adicionada!</> : <><ShoppingBag className="h-3.5 w-3.5" /> Adicionar ao carrinho</>}
      </button>
    </article>
  );
}
