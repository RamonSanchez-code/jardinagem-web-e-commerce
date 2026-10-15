export type PotColor = { name: string; hex: string };
export type PotSize = { id: string; label: string; deltaCents: number };
export type KitItem = { productSlug?: string; name: string; qty: number };

export type Product = {
  id: number;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  category: string; // plantas | flores | vasos | kits | ferramentas | substratos
  subcategory: string;
  priceCents: number;
  compareAtCents: number | null;
  image: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  active: boolean;
  // Atributos de cuidado (plantas/flores)
  height: string | null;
  light: string | null;
  water: string | null;
  environment: string | null; // interno | externo | ambos
  careLevel: string | null; // fácil | moderado | exigente
  // Configuração do personalizador
  inCustomizer: boolean;
  potStyle: string | null; // classico | bojo | geometrico | alto | tigela
  potColors: PotColor[] | null;
  sizes: PotSize[] | null;
  materialKind: string | null; // substrato | drenagem | cobertura | acessorio
  plantModel: string | null; // folhagem | pendente | palmeira | cacto | suculenta | orquidea | flores
  kitItems: KitItem[] | null;
  createdAt: Date;
};

export type Service = {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
  priceLabel: string;
  area: string;
  active: boolean;
};

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

/** Pedido gerado no checkout (mantido apenas no navegador) */
export type Order = {
  code: string;
  customer: { name: string; email: string; phone: string };
  address: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  } | null;
  delivery: "entrega" | "retirada";
  items: {
    kind: "produto" | "personalizado";
    productId?: number;
    name: string;
    image: string;
    unitPriceCents: number;
    qty: number;
    lines?: string[];
  }[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};
