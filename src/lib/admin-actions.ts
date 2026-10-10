"use server";

import { db } from "@/db";
import {
  products,
  orders,
  services,
  serviceRequests,
  settings,
  type Benefit,
  type DeliverySettings,
  type PotColor,
  type PotSize,
  type KitItem,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { size } from "@/lib/format";

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.role !== "admin") throw new Error("Acesso negado.");
  return s;
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "");
  const cents = v.includes(",") || v.includes(".")
    ? Math.round(parseFloat(v.replace(/\./g, "").replace(",", ".")) * 100)
    : Number(v) || 0;
  return cents;
};
const intRaw = (f: FormData, k: string) => Number(f.get(k) ?? 0) || 0;
const bool = (f: FormData, k: string) => f.get(k) === "on";

function jsonOr<T>(raw: string, fallback: T): T {
  if (!raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Nome obrigatório.");
  const slug = str(formData, "slug") || size.slugify(name);
  const data = {
    slug,
    name,
    shortDesc: str(formData, "shortDesc"),
    description: str(formData, "description"),
    category: str(formData, "category") || "plantas",
    subcategory: str(formData, "subcategory"),
    priceCents: int(formData, "price"),
    compareAtCents: int(formData, "compareAt") || null,
    image: str(formData, "image"),
    stock: intRaw(formData, "stock"),
    featured: bool(formData, "featured"),
    bestseller: bool(formData, "bestseller"),
    isNew: bool(formData, "isNew"),
    active: bool(formData, "active"),
    height: str(formData, "height") || null,
    light: str(formData, "light") || null,
    water: str(formData, "water") || null,
    environment: str(formData, "environment") || null,
    careLevel: str(formData, "careLevel") || null,
    inCustomizer: bool(formData, "inCustomizer"),
    potStyle: str(formData, "potStyle") || null,
    materialKind: str(formData, "materialKind") || null,
    plantModel: str(formData, "plantModel") || null,
    potColors: jsonOr<PotColor[] | null>(str(formData, "potColors"), null),
    sizes: jsonOr<PotSize[] | null>(str(formData, "sizes"), null),
    kitItems: jsonOr<KitItem[] | null>(str(formData, "kitItems"), null),
  };
  if (id) {
    await db.update(products).set(data).where(eq(products.id, id));
  } else {
    await db.insert(products).values(data);
  }
  revalidatePath("/admin");
  revalidatePath("/loja");
  revalidatePath("/");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  if (id) await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin");
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const field = str(formData, "field");
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return;
  if (field === "active") await db.update(products).set({ active: !p.active }).where(eq(products.id, id));
  if (field === "featured") await db.update(products).set({ featured: !p.featured }).where(eq(products.id, id));
  revalidatePath("/admin");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const status = str(formData, "status");
  if (id && status) await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin");
}

export async function saveServiceAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const data = {
    name: str(formData, "name"),
    description: str(formData, "description"),
    priceLabel: str(formData, "priceLabel") || "Sob consulta",
    area: str(formData, "area"),
    image: str(formData, "image"),
    active: bool(formData, "active"),
  };
  if (id) await db.update(services).set(data).where(eq(services.id, id));
  revalidatePath("/admin");
  revalidatePath("/servicos");
}

export async function toggleServiceAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const [s] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (s) await db.update(services).set({ active: !s.active }).where(eq(services.id, id));
  revalidatePath("/admin");
  revalidatePath("/servicos");
}

export async function updateRequestStatusAction(formData: FormData) {
  await requireAdmin();
  const id = intRaw(formData, "id");
  const status = str(formData, "status");
  if (id && status)
    await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id));
  revalidatePath("/admin");
}

type SettingsPayload =
  | { type: "benefits"; value: Benefit[] }
  | { type: "delivery"; value: DeliverySettings };

export async function saveSettingsAction(payload: SettingsPayload) {
  await requireAdmin();
  const { type, value } = payload;
  await db
    .insert(settings)
    .values({ key: type, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
