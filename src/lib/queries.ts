import { products, services } from "@/data/catalog";
import type { Product, Benefit, DeliverySettings } from "@/lib/types";

/* ---------------------------------- Produtos --------------------------------- */

const active = () => products.filter((p) => p.active);

export async function getProducts(opts?: {
  category?: string;
  q?: string;
  featured?: boolean;
  bestseller?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const q = opts?.q?.toLowerCase();
  return active()
    .filter((p) => !opts?.category || p.category === opts.category)
    .filter(
      (p) =>
        !q ||
        [p.name, p.shortDesc, p.subcategory].some((f) => f.toLowerCase().includes(q))
    )
    .filter((p) => !opts?.featured || p.featured)
    .filter((p) => !opts?.bestseller || p.bestseller)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, opts?.limit ?? 200);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelated(
  category: string,
  excludeId: number,
  limit = 4
): Promise<Product[]> {
  return active()
    .filter((p) => p.category === category && p.id !== excludeId)
    .sort((a, b) => Number(b.bestseller) - Number(a.bestseller))
    .slice(0, limit);
}

export async function getNewArrivals(limit = 8) {
  return active()
    .filter((p) => p.isNew)
    .slice(0, limit);
}

export async function getCustomizerData() {
  const all = active()
    .filter((p) => p.inCustomizer)
    .sort((a, b) => a.priceCents - b.priceCents);
  return {
    pots: all.filter((p) => p.category === "vasos"),
    materials: all.filter((p) => p.category === "substratos" || p.materialKind),
    plants: all.filter(
      (p) => p.category === "plantas" || p.category === "flores"
    ),
  };
}

/* ---------------------------------- Serviços --------------------------------- */

export async function getActiveServices() {
  return services.filter((s) => s.active);
}

/* ---------------------------------- Configurações ----------------------------- */

export const BENEFITS: Benefit[] = [
  { icon: "truck", title: "Entrega programada", text: "Escolha o melhor dia para receber suas plantas." },
  { icon: "leaf", title: "Plantas selecionadas", text: "Mudas saudáveis, escolhidas uma a uma." },
  { icon: "package", title: "Kits completos", text: "Tudo o que você precisa em uma única compra." },
  { icon: "message", title: "Atendimento especializado", text: "Time de jardinagem para tirar suas dúvidas." },
];

export const DELIVERY: DeliverySettings = {
  note: "Entregamos em Cotia, Granja Viana e região metropolitana de SP.",
  baseFeeCents: 1990,
  freeAboveCents: 29900,
  pickupNote: "Retire na loja sem custo: Estrada das Palmeiras, 1200 — Cotia, SP.",
};

export async function getBenefits(): Promise<Benefit[]> {
  return BENEFITS;
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  return DELIVERY;
}
