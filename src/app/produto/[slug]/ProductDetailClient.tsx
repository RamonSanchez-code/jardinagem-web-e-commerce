"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sun, Droplets, Ruler, Home, Leaf, Minus, Plus, Package,
  Truck, ShieldCheck, Sparkles, Check,
} from "lucide-react";
import type { Product } from "@/db/schema";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { brl } from "@/lib/format";
import { categoryName } from "@/lib/site";

export function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const imgWrap = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");

  const onMove = (e: React.MouseEvent) => {
    const r = imgWrap.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const care = [
    { icon: <Sun className="h-4 w-4" />, label: "Luz", value: product.light },
    { icon: <Droplets className="h-4 w-4" />, label: "Rega", value: product.water },
    { icon: <Ruler className="h-4 w-4" />, label: "Altura aprox.", value: product.height },
    { icon: <Home className="h-4 w-4" />, label: "Ambiente", value: product.environment },
    { icon: <Leaf className="h-4 w-4" />, label: "Cuidado", value: product.careLevel },
  ].filter((c) => c.value);

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* Galeria com zoom */}
      <div>
        <div
          ref={imgWrap}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
          className="relative aspect-[4/4.4] cursor-zoom-in overflow-hidden rounded-3xl bg-sand/60 ring-1 ring-sand"
        >
          <Image
            src={product.image || "/img/monte-seu-vaso-banner.jpg"}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out"
            style={{ transform: zoom ? "scale(1.65)" : "scale(1)", transformOrigin: origin }}
          />
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="rounded-full bg-forest px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-cream">Novidade</span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-terracotta px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">Mais vendido</span>
            )}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-stonegray">Passe o mouse sobre a imagem para ampliar</p>
      </div>

      {/* Informações comerciais */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-terracotta">
          {categoryName(product.category)}{product.subcategory ? ` · ${product.subcategory}` : ""}
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-forest sm:text-4xl">
          {product.name}
        </h1>
        {product.shortDesc && (
          <p className="mt-3 text-base leading-relaxed text-stonegray">{product.shortDesc}</p>
        )}

        <div className="mt-6 flex items-end gap-3">
          <p className="text-3xl font-bold text-forest">{brl(product.priceCents)}</p>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <p className="pb-1 text-base text-stonegray line-through">{brl(product.compareAtCents)}</p>
          )}
        </div>
        <p className={`mt-1.5 text-sm font-medium ${product.stock > 0 ? "text-primary" : "text-terracotta-dark"}`}>
          {product.stock > 0
            ? `Em estoque${product.stock <= 5 ? ` — últimas ${product.stock} unidades` : ""}`
            : "Indisponível no momento"}
        </p>

        {care.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {care.map((c) => (
              <div key={c.label} className="rounded-xl bg-white p-3 ring-1 ring-sand">
                <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-stonegray">
                  <span className="text-primary">{c.icon}</span> {c.label}
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-ink">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-sand-dark bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-3.5 text-ink/70 transition hover:text-forest"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold" aria-live="polite">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock || 10, q + 1))}
              className="p-3.5 text-ink/70 transition hover:text-forest"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="min-w-56 flex-1">
            <AddToCartButton
              item={{
                kind: "produto",
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                unitPriceCents: product.priceCents,
                meta: product.subcategory || undefined,
              }}
              qty={qty}
              disabled={product.stock <= 0}
              label={product.stock > 0 ? "Adicionar ao carrinho" : "Indisponível"}
            />
          </div>
        </div>

        {product.inCustomizer && product.category === "vasos" && (
          <Link
            href={`/monte-seu-vaso?vaso=${product.id}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-full border border-terracotta/50 bg-terracotta/5 px-8 py-3.5 text-sm font-semibold text-terracotta-dark transition hover:bg-terracotta hover:text-white"
          >
            <Sparkles className="h-4 w-4" /> Personalizar este vaso em 3D
          </Link>
        )}

        {product.kitItems && product.kitItems.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-sand">
            <h2 className="flex items-center gap-2 text-sm font-bold text-forest">
              <Package className="h-4 w-4" /> O que está incluído neste kit
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.kitItems.map((it) => (
                <li key={it.name} className="flex items-start gap-2 text-sm text-ink/80">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {it.name}{it.qty > 1 ? ` (${it.qty} un.)` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.description && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-forest">Descrição</h2>
            <p className="mt-2.5 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink/75">
              {product.description}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 border-t border-sand pt-6 text-sm text-ink/70 sm:grid-cols-2">
          <p className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-primary" /> Entrega programada disponível
          </p>
          <p className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Plantas selecionadas e embaladas com cuidado
          </p>
        </div>
      </div>
    </div>
  );
}
