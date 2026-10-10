import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelated } from "@/lib/queries";
import { categoryName } from "@/lib/site";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  return { title: p.name, description: p.shortDesc || p.description.slice(0, 150) };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();
  const related = await getRelated(product.category, product.id, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-stonegray" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-forest">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/loja" className="hover:text-forest">Loja</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/loja?categoria=${product.category}`} className="hover:text-forest">
          {categoryName(product.category)}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="max-w-[40vw] truncate font-medium text-ink">{product.name}</span>
      </nav>

      <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display mb-8 text-2xl font-semibold text-forest sm:text-3xl">
            Você também pode gostar
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
