"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, SearchX, X } from "lucide-react";
import type { Product } from "@/db/schema";
import { ProductCard } from "@/components/site/ProductCard";
import { brl } from "@/lib/format";

type Cat = { slug: string; name: string };

export function CatalogClient({
  products,
  categories,
  activeCategory,
  query,
  maxPrice,
}: {
  products: Product[];
  categories: Cat[];
  activeCategory: string;
  query: string;
  maxPrice: number;
}) {
  const router = useRouter();
  const [maxP, setMaxP] = useState(maxPrice);
  const [environment, setEnvironment] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("relevancia");
  const [visible, setVisible] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const environments = useMemo(
    () => [...new Set(products.map((p) => p.environment).filter(Boolean))] as string[],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.priceCents <= maxP &&
        (!environment || p.environment === environment) &&
        (!stockOnly || p.stock > 0)
    );
    switch (sort) {
      case "menor-preco": list = [...list].sort((a, b) => a.priceCents - b.priceCents); break;
      case "maior-preco": list = [...list].sort((a, b) => b.priceCents - a.priceCents); break;
      case "novidades":
        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "vendidos":
        list = [...list].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
        break;
    }
    return list;
  }, [products, maxP, environment, stockOnly, sort]);

  const go = (cat: string) => {
    setVisible(12);
    router.push(cat ? `/loja?categoria=${cat}` : "/loja");
  };

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">Categorias</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => go("")}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${!activeCategory ? "bg-forest font-semibold text-cream" : "text-ink/80 hover:bg-sand/60"}`}
            >
              Todos os produtos
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => go(c.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeCategory === c.slug ? "bg-forest font-semibold text-cream" : "text-ink/80 hover:bg-sand/60"}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">Preço até</h3>
        <input
          type="range"
          min={1000}
          max={maxPrice}
          step={500}
          value={maxP}
          onChange={(e) => { setMaxP(Number(e.target.value)); setVisible(12); }}
          className="w-full accent-primary"
          aria-label="Preço máximo"
        />
        <p className="mt-1 text-sm font-semibold text-ink">{brl(maxP)}</p>
      </div>

      {environments.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">Ambiente</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEnvironment("")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${!environment ? "bg-forest text-cream" : "bg-sand/70 text-ink/70 hover:bg-sand"}`}
            >
              Todos
            </button>
            {environments.map((e) => (
              <button
                key={e}
                onClick={() => setEnvironment(e)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${environment === e ? "bg-forest text-cream" : "bg-sand/70 text-ink/70 hover:bg-sand"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={stockOnly}
          onChange={(e) => setStockOnly(e.target.checked)}
          className="h-4 w-4 rounded accent-primary"
        />
        Somente em estoque
      </label>

      {(environment || stockOnly || maxP < maxPrice) && (
        <button
          onClick={() => { setEnvironment(""); setStockOnly(false); setMaxP(maxPrice); }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
        >
          <X className="h-3.5 w-3.5" /> Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
      {/* Filtros desktop */}
      <aside className="hidden lg:block">{filterPanel}</aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stonegray">
            {filtered.length} produto{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white px-4 py-2 text-xs font-semibold text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-sand-dark bg-white px-4 py-2 text-xs font-semibold text-ink outline-none"
              aria-label="Ordenar"
            >
              <option value="relevancia">Relevância</option>
              <option value="vendidos">Mais vendidos</option>
              <option value="novidades">Novidades</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-sand-dark bg-white/60 py-24 text-center">
            <SearchX className="h-10 w-10 text-sand-dark" />
            <div>
              <p className="font-display text-xl font-semibold text-ink">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-stonegray">Ajuste os filtros ou tente outra busca.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, visible).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisible((v) => v + 12)}
                  className="rounded-full border border-forest/25 bg-white px-8 py-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-cream"
                >
                  Carregar mais produtos
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer de filtros mobile */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-forest/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-cream p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-forest">Filtros</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros" className="rounded-full p-2 hover:bg-sand/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-8 w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream"
            >
              Ver {filtered.length} produto{filtered.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
