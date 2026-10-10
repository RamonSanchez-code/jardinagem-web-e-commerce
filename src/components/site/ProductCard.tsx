"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check, Sun, Droplets, Ruler } from "lucide-react";
import type { Product } from "@/db/schema";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add({
      kind: "produto",
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPriceCents: product.priceCents,
      meta: product.subcategory || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-sand transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10 hover:ring-sand-dark">
      <Link href={`/produto/${product.slug}`} className="relative block aspect-[5/4] overflow-hidden bg-sand/60">
        <Image
          src={product.image || "/img/monte-seu-vaso-banner.jpg"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-forest px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-cream">Novidade</span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-terracotta px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-white">Mais vendido</span>
          )}
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-forest">
              -{Math.round((1 - product.priceCents / product.compareAtCents) * 100)}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-ink transition group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.shortDesc && (
          <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-stonegray">{product.shortDesc}</p>
        )}

        {(product.light || product.water || product.height) && (
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-stonegray">
            {product.light && <span className="inline-flex items-center gap-1"><Sun className="h-3 w-3" />{product.light}</span>}
            {product.water && <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" />{product.water}</span>}
            {product.height && <span className="inline-flex items-center gap-1"><Ruler className="h-3 w-3" />{product.height}</span>}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.compareAtCents && product.compareAtCents > product.priceCents && (
              <p className="text-[0.7rem] text-stonegray line-through">{brl(product.compareAtCents)}</p>
            )}
            <p className="text-lg font-bold text-forest">{brl(product.priceCents)}</p>
          </div>
          <button
            onClick={onAdd}
            disabled={product.stock <= 0}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
              product.stock <= 0
                ? "cursor-not-allowed bg-sand text-stonegray"
                : added
                  ? "bg-leaf text-white"
                  : "bg-primary text-white hover:bg-forest"
            }`}
            aria-live="polite"
          >
            {product.stock <= 0 ? (
              "Esgotado"
            ) : added ? (
              <><Check className="h-3.5 w-3.5" /> Adicionado</>
            ) : (
              <><ShoppingBag className="h-3.5 w-3.5" /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
