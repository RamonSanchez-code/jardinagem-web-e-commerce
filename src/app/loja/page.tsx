import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import { categories } from "@/lib/site";
import { CatalogClient } from "./CatalogClient";

export const metadata: Metadata = {
  title: "Loja",
  description: "Plantas, flores, vasos, kits, ferramentas e substratos selecionados.",
};

export const dynamic = "force-dynamic";

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; ordem?: string }>;
}) {
  const params = await searchParams;
  const categoria = params.categoria || "";
  const q = params.q || "";
  const [all, catalog] = await Promise.all([
    getProducts({}),
    getProducts({ category: categoria || undefined, q: q || undefined }),
  ]);

  const maxPrice = Math.max(100, ...all.map((p) => p.priceCents));
  const cat = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Loja</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">
          {q ? `Busca: “${q}”` : cat ? cat.name : "Todos os produtos"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stonegray">
          {q
            ? `${catalog.length} resultado(s) para a sua busca.`
            : cat
              ? cat.description
              : "Todo o catálogo: plantas, flores, vasos, kits, ferramentas e materiais."}
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-stonegray">Carregando catálogo...</p>}>
        <CatalogClient
          products={JSON.parse(JSON.stringify(catalog))}
          categories={[...categories.map((c) => ({ slug: c.slug, name: c.name }))]}
          activeCategory={categoria}
          query={q}
          maxPrice={maxPrice}
        />
      </Suspense>
    </div>
  );
}
