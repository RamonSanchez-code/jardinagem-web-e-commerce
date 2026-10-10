import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type PotColor = { name: string; hex: string };
export type PotSize = { id: string; label: string; deltaCents: number };
export type KitItem = { productSlug?: string; name: string; qty: number };

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer | admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDesc: text("short_desc").notNull().default(""),
  description: text("description").notNull().default(""),
  category: text("category").notNull(), // plantas | flores | vasos | kits | ferramentas | substratos
  subcategory: text("subcategory").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  compareAtCents: integer("compare_at_cents"),
  image: text("image").notNull().default(""),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  bestseller: boolean("bestseller").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  active: boolean("active").notNull().default(true),
  // Atributos de cuidado (plantas/flores) — dados revisados e editáveis no admin
  height: text("height"),
  light: text("light"),
  water: text("water"),
  environment: text("environment"), // interno | externo | ambos
  careLevel: text("care_level"), // fácil | moderado | exigente
  // Configuração do personalizador
  inCustomizer: boolean("in_customizer").notNull().default(false),
  potStyle: text("pot_style"), // classico | bojo | geometrico | alto | tigela
  potColors: jsonb("pot_colors").$type<PotColor[]>(),
  sizes: jsonb("sizes").$type<PotSize[]>(),
  materialKind: text("material_kind"), // substrato | drenagem | cobertura | acessorio
  plantModel: text("plant_model"), // folhagem | pendente | palmeira | cacto | suculenta | orquidea | flores
  kitItems: jsonb("kit_items").$type<KitItem[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  priceLabel: text("price_label").notNull().default("Sob consulta"),
  area: text("area").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id"),
  serviceName: text("service_name").notNull().default(""),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  city: text("city").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("novo"), // novo | em_atendimento | concluido
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id"),
  customer: jsonb("customer")
    .$type<{ name: string; email: string; phone: string }>()
    .notNull(),
  address: jsonb("address").$type<{
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  } | null>(),
  delivery: text("delivery").notNull().default("entrega"), // entrega | retirada
  items: jsonb("items")
    .$type<
      {
        kind: "produto" | "personalizado";
        productId?: number;
        name: string;
        image: string;
        unitPriceCents: number;
        qty: number;
        config?: unknown;
        lines?: string[];
      }[]
    >()
    .notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  discountCents: integer("discount_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("recebido"), // recebido | em_separacao | enviado | entregue | cancelado
  paymentMethod: text("payment_method").notNull().default("demo"),
  paymentStatus: text("payment_status").notNull().default("demo_aprovado"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

export const compositions = pgTable("compositions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull().default("Minha composição"),
  config: jsonb("config").$type<CustomConfig>().notNull(),
  totalCents: integer("total_cents").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
});

/** Configuração de uma composição do Monte seu vaso */
export type CustomConfig = {
  potId: number;
  potName: string;
  potStyle?: string;
  potColor?: string;
  potColorHex?: string;
  sizeId?: string;
  sizeLabel?: string;
  materials: { id: number; name: string; qty: number }[];
  plants: { id: number; name: string; model?: string }[];
  flowerColor?: string;
};

export type Benefit = { icon: string; title: string; text: string };
export type DeliverySettings = {
  note: string;
  baseFeeCents: number;
  freeAboveCents: number;
  pickupNote: string;
};
