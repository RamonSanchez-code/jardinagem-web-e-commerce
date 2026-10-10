import { db } from "@/db";
import {
  products,
  services,
  orders,
  serviceRequests,
  compositions,
  settings,
  users,
  type Product,
  type DeliverySettings,
  type Benefit,
} from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

/* ---------------------------------- Produtos --------------------------------- */

export async function getProducts(opts?: {
  category?: string;
  q?: string;
  featured?: boolean;
  bestseller?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const conds = [eq(products.active, true)];
  if (opts?.category) conds.push(eq(products.category, opts.category));
  if (opts?.q)
    conds.push(
      or(
        ilike(products.name, `%${opts.q}%`),
        ilike(products.shortDesc, `%${opts.q}%`),
        ilike(products.subcategory, `%${opts.q}%`)
      )!
    );
  if (opts?.featured) conds.push(eq(products.featured, true));
  if (opts?.bestseller) conds.push(eq(products.bestseller, true));

  return db
    .select()
    .from(products)
    .where(and(...conds))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(opts?.limit ?? 200);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids.length) return [];
  return db
    .select()
    .from(products)
    .where(sql`${products.id} = any(${ids})`);
}

export async function getRelated(
  category: string,
  excludeId: number,
  limit = 4
): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(
      and(eq(products.category, category), eq(products.active, true), sql`${products.id} <> ${excludeId}`)
    )
    .orderBy(desc(products.bestseller))
    .limit(limit);
}

export async function getNewArrivals(limit = 8) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.isNew, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getCustomizerData() {
  const all = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.inCustomizer, true)))
    .orderBy(asc(products.priceCents));
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
  return db
    .select()
    .from(services)
    .where(eq(services.active, true))
    .orderBy(asc(services.id));
}

export async function getAllServices() {
  return db.select().from(services).orderBy(asc(services.id));
}

/* ---------------------------------- Pedidos ---------------------------------- */

export async function getOrderByCode(code: string) {
  const rows = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  return rows[0] ?? null;
}

export async function getOrdersByUser(userId: number) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50);
}

export async function getCompositionsByUser(userId: number) {
  return db
    .select()
    .from(compositions)
    .where(eq(compositions.userId, userId))
    .orderBy(desc(compositions.createdAt))
    .limit(50);
}

/* ---------------------------------- Configurações ----------------------------- */

export const DEFAULT_BENEFITS: Benefit[] = [
  { icon: "truck", title: "Entrega programada", text: "Escolha o melhor dia para receber suas plantas." },
  { icon: "leaf", title: "Plantas selecionadas", text: "Mudas saudáveis, escolhidas uma a uma." },
  { icon: "package", title: "Kits completos", text: "Tudo o que você precisa em uma única compra." },
  { icon: "message", title: "Atendimento especializado", text: "Time de jardinagem para tirar suas dúvidas." },
];

export const DEFAULT_DELIVERY: DeliverySettings = {
  note: "Entregamos em Cotia, Granja Viana e região metropolitana de SP.",
  baseFeeCents: 1990,
  freeAboveCents: 29900,
  pickupNote: "Retire na loja sem custo: Estrada das Palmeiras, 1200 — Cotia, SP.",
};

export async function getBenefits(): Promise<Benefit[]> {
  const rows = await db.select().from(settings).where(eq(settings.key, "benefits")).limit(1);
  return (rows[0]?.value as Benefit[]) ?? DEFAULT_BENEFITS;
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const rows = await db.select().from(settings).where(eq(settings.key, "delivery")).limit(1);
  return (rows[0]?.value as DeliverySettings) ?? DEFAULT_DELIVERY;
}

/* ---------------------------------- Admin ------------------------------------- */

export async function getAllProducts() {
  return db.select().from(products).orderBy(desc(products.createdAt)).limit(500);
}

export async function getAllOrders() {
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
}

export async function getAllServiceRequests() {
  return db
    .select()
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(200);
}

export async function getCounts() {
  const [p, o, s, u] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(products),
    db.select({ n: sql<number>`count(*)` }).from(orders),
    db.select({ n: sql<number>`count(*)` }).from(serviceRequests),
    db.select({ n: sql<number>`count(*)` }).from(users),
  ]);
  return {
    products: Number(p[0]?.n ?? 0),
    orders: Number(o[0]?.n ?? 0),
    serviceRequests: Number(s[0]?.n ?? 0),
    users: Number(u[0]?.n ?? 0),
  };
}
