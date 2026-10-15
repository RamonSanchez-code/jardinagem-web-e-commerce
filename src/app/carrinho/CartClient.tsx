"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Truck, Store, ArrowRight } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/cart";
import { brl } from "@/lib/format";
import type { DeliverySettings } from "@/lib/types";

export function CartClient({ delivery }: { delivery: DeliverySettings }) {
  const { items, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-sand/60" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-sand-dark bg-white/60 py-24 text-center">
        <span className="rounded-full bg-sand/70 p-6 text-stonegray">
          <ShoppingBag className="h-10 w-10" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold text-ink">Seu carrinho está vazio</p>
          <p className="mt-2 text-sm text-stonegray">Que tal começar por uma planta ou montar seu próprio vaso?</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/loja" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-forest">
            Explorar a loja
          </Link>
          <Link href="/monte-seu-vaso" className="rounded-full border border-forest/25 px-7 py-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-cream">
            Monte seu vaso
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const freeShipping = subtotal >= delivery.freeAboveCents;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-sand sm:gap-6 sm:p-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand/60 sm:h-28 sm:w-28">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-stonegray">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {item.kind === "produto" && item.slug ? (
                    <Link href={`/produto/${item.slug}`} className="font-display text-base font-semibold leading-snug text-ink hover:text-primary sm:text-lg">
                      {item.name}
                    </Link>
                  ) : (
                    <h3 className="font-display text-base font-semibold leading-snug text-ink sm:text-lg">{item.name}</h3>
                  )}
                  {item.kind === "personalizado" && item.lines && (
                    <ul className="mt-1.5 space-y-0.5 text-[0.7rem] text-stonegray">
                      {item.lines.map((l, i) => <li key={i}>· {l}</li>)}
                    </ul>
                  )}
                  {item.kind === "personalizado" && (
                    <Link href="/monte-seu-vaso" className="mt-1.5 inline-block text-xs font-semibold text-terracotta-dark hover:underline">
                      Editar composição
                    </Link>
                  )}
                  {item.meta && <p className="mt-0.5 text-xs text-stonegray">{item.meta}</p>}
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="rounded-full p-2 text-stonegray transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center rounded-full border border-sand-dark">
                  <button onClick={() => setQty(item.id, item.qty - 1)} className="p-2.5 text-ink/60 hover:text-forest" aria-label="Diminuir quantidade">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => setQty(item.id, item.qty + 1)} className="p-2.5 text-ink/60 hover:text-forest" aria-label="Aumentar quantidade">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[0.7rem] text-stonegray">{brl(item.unitPriceCents)} un.</p>
                  <p className="text-base font-bold text-forest">{brl(item.unitPriceCents * item.qty)}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Resumo */}
      <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-sand lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-semibold text-forest">Resumo do pedido</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-stonegray">Subtotal</dt>
            <dd className="font-semibold">{brl(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stonegray">Frete</dt>
            <dd className="font-semibold">{freeShipping ? "Grátis" : "Calculado no checkout"}</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-3 text-base">
            <dt className="font-bold">Total estimado</dt>
            <dd className="font-bold text-forest">{brl(subtotal)}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2 rounded-2xl bg-cream p-4 text-xs text-stonegray">
          <p className="flex items-start gap-2">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {freeShipping
              ? "Você ganhou frete grátis para a região de entrega!"
              : `Frete grátis em pedidos acima de ${brl(delivery.freeAboveCents)}.`}
          </p>
          <p className="flex items-start gap-2">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {delivery.pickupNote}
          </p>
        </div>

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white transition hover:bg-forest"
        >
          Finalizar compra <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/loja" className="mt-3 block text-center text-sm font-semibold text-forest underline-offset-4 hover:underline">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
