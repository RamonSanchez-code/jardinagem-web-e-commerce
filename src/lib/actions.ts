"use server";

import { db } from "@/db";
import {
  users,
  orders,
  serviceRequests,
  compositions,
  products,
  type CustomConfig,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";
import { generateOrderCode } from "@/lib/format";
import { getDeliverySettings } from "@/lib/queries";

/* ----------------------------------- Auth ----------------------------------- */

type FormState = { error?: string; success?: string };

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email.includes("@") || password.length < 6)
    return { error: "Preencha nome, e-mail válido e senha com 6+ caracteres." };

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "Este e-mail já está cadastrado." };

  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash: hashPassword(password), role: "customer" })
    .returning();
  const u = inserted[0];
  await setSessionCookie({ uid: u.id, name: u.name, email: u.email, role: "customer" });
  redirect("/conta");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const u = rows[0];
  if (!u || !verifyPassword(password, u.passwordHash))
    return { error: "E-mail ou senha incorretos." };
  await setSessionCookie({
    uid: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "admin" ? "admin" : "customer",
  });
  redirect(u.role === "admin" ? "/admin" : "/conta");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

/* ---------------------------- Solicitação de serviço ------------------------- */

export async function serviceRequestAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const serviceId = Number(formData.get("serviceId") ?? 0) || null;
  const serviceName = String(formData.get("serviceName") ?? "Contato").trim();
  if (!name || !email.includes("@") || !message)
    return { error: "Preencha nome, e-mail válido e mensagem." };
  await db.insert(serviceRequests).values({
    serviceId, serviceName, name, email, phone, city, message,
  });
  return { success: "Solicitação enviada! Nossa equipe retornará em breve." };
}

/* ------------------------------ Checkout (pedido) ---------------------------- */

export type CheckoutItemInput = {
  kind: "produto" | "personalizado";
  productId?: number;
  qty: number;
  custom?: CustomConfig;
};

export type CheckoutInput = {
  customer: { name: string; email: string; phone: string };
  delivery: "entrega" | "retirada";
  address?: {
    cep: string; rua: string; numero: string; complemento?: string;
    bairro: string; cidade: string; uf: string;
  };
  items: CheckoutItemInput[];
  paymentMethod: "demo";
};

export async function placeOrderAction(input: CheckoutInput): Promise<
  | { ok: true; code: string; totalCents: number }
  | { ok: false; error: string }
> {
  const { customer, delivery, address, items } = input;
  if (!customer?.name || !customer?.email?.includes("@") || !customer?.phone)
    return { ok: false, error: "Preencha seus dados de contato." };
  if (delivery === "entrega") {
    const a = address;
    if (!a?.cep || !a.rua || !a.numero || !a.bairro || !a.cidade || !a.uf)
      return { ok: false, error: "Preencha o endereço de entrega completo." };
  }
  if (!items?.length) return { ok: false, error: "Seu carrinho está vazio." };

  // ---- Validação de preços no servidor: nenhum valor do cliente é confiável ----
  const orderItems: {
    kind: "produto" | "personalizado";
    productId?: number;
    name: string;
    image: string;
    unitPriceCents: number;
    qty: number;
    config?: unknown;
    lines?: string[];
  }[] = [];
  const stockUpdates: { id: number; qty: number }[] = [];

  for (const item of items) {
    const qty = Math.max(1, Math.min(20, Math.floor(item.qty || 1)));
    if (item.kind === "produto") {
      if (!item.productId) return { ok: false, error: "Item inválido." };
      const [p] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!p || !p.active) return { ok: false, error: `Produto indisponível: ${item.productId}` };
      if (p.stock < qty) return { ok: false, error: `Estoque insuficiente para ${p.name}.` };
      orderItems.push({
        kind: "produto", productId: p.id, name: p.name, image: p.image,
        unitPriceCents: p.priceCents, qty,
      });
      stockUpdates.push({ id: p.id, qty });
    } else {
      const c = item.custom;
      if (!c?.potId) return { ok: false, error: "Composição inválida." };
      const [pot] = await db.select().from(products).where(eq(products.id, c.potId)).limit(1);
      if (!pot || !pot.active || !pot.inCustomizer)
        return { ok: false, error: "Vaso selecionado indisponível." };
      let total = pot.priceCents;
      const lines: string[] = [`Vaso ${pot.name}${c.potColor ? ` — ${c.potColor}` : ""}`];
      stockUpdates.push({ id: pot.id, qty });

      if (c.sizeId && pot.sizes?.length) {
        const s = pot.sizes.find((x) => x.id === c.sizeId);
        if (!s) return { ok: false, error: "Tamanho de vaso inválido." };
        total += s.deltaCents;
        lines[0] += ` (${s.label})`;
      }
      for (const m of (c.materials ?? []).slice(0, 8)) {
        const mqty = Math.max(1, Math.min(3, Math.floor(m.qty || 1)));
        const [mp] = await db.select().from(products).where(eq(products.id, m.id)).limit(1);
        if (!mp || !mp.active || !mp.inCustomizer || mp.category !== "substratos") continue;
        total += mp.priceCents * mqty;
        lines.push(`${mp.name} × ${mqty}`);
        stockUpdates.push({ id: mp.id, qty: mqty * qty });
      }
      const plantList = (c.plants ?? []).slice(0, 3);
      if (!plantList.length) return { ok: false, error: "Escolha ao menos uma planta." };
      for (const pl of plantList) {
        const [pp] = await db.select().from(products).where(eq(products.id, pl.id)).limit(1);
        if (!pp || !pp.active || !pp.inCustomizer) continue;
        total += pp.priceCents;
        lines.push(pp.name);
        stockUpdates.push({ id: pp.id, qty });
      }
      orderItems.push({
        kind: "personalizado",
        name: `Vaso personalizado — ${pot.name}`,
        image: pot.image,
        unitPriceCents: total,
        qty,
        config: c,
        lines,
      });
    }
  }

  const subtotal = orderItems.reduce((a, i) => a + i.unitPriceCents * i.qty, 0);
  const d = await getDeliverySettings();
  const shipping =
    delivery === "retirada"
      ? 0
      : subtotal >= d.freeAboveCents
        ? 0
        : d.baseFeeCents;
  const total = subtotal + shipping;

  const session = await getSession();
  const code = generateOrderCode();
  await db.insert(orders).values({
    code,
    userId: session?.uid ?? null,
    customer,
    address: delivery === "entrega" ? (address ?? null) : null,
    delivery,
    items: orderItems,
    subtotalCents: subtotal,
    shippingCents: shipping,
    discountCents: 0,
    totalCents: total,
    status: "recebido",
    paymentMethod: "demo",
    paymentStatus: "demo_aprovado",
  });

  // Baixa de estoque
  for (const s of stockUpdates) {
    await db
      .update(products)
      .set({ stock: sql`greatest(0, ${products.stock} - ${s.qty})` })
      .where(eq(products.id, s.id));
  }

  return { ok: true, code, totalCents: total };
}

/* ----------------------------- Composições salvas ---------------------------- */

export async function saveCompositionAction(
  config: CustomConfig,
  totalCents: number,
  name?: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Entre na sua conta para salvar." };
  await db.insert(compositions).values({
    userId: session.uid,
    name: name?.trim() || "Minha composição",
    config,
    totalCents,
  });
  return { ok: true };
}
