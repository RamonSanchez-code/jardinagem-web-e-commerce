/**
 * Configuração central da marca — altere aqui para renomear a loja.
 */
export const site = {
  name: "Nature",
  suffix: "Paisagismo",
  get fullName() {
    return `${this.name} ${this.suffix}`;
  },
  tagline: "Seu viver mais verde começa aqui.",
  taglineSub:
    "Plantas, vasos e kits para transformar seus espaços em ambientes mais verdes, bonitos e acolhedores.",
  description:
    "Loja de plantas, flores, vasos, kits de jardinagem e serviços de paisagismo. Monte seu vaso personalizado em 3D e receba em casa.",
  phone: "(11) 4002-8922",
  whatsapp: "5511999990000",
  email: "contato@naturepaisagismo.com.br",
  address: "Estrada das Palmeiras, 1200 — Cotia, SP",
  hours: "Seg. a sáb., 8h às 18h",
  social: {
    instagram: "https://instagram.com/naturepaisagismo",
    facebook: "https://facebook.com/naturepaisagismo",
    pinterest: "https://pinterest.com/naturepaisagismo",
  },
  cnpj: "00.000.000/0001-00",
};

export const categories = [
  {
    slug: "plantas",
    name: "Plantas",
    description:
      "Espécies ornamentais selecionadas para ambientes internos e jardins externos.",
    image:
      "https://images.pexels.com/photos/19923748/pexels-photo-19923748.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "flores",
    name: "Flores",
    description:
      "Orquídeas, buquês e arranjos frescos para presentear e decorar.",
    image:
      "https://images.pexels.com/photos/11255737/pexels-photo-11255737.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "vasos",
    name: "Vasos",
    description:
      "Cerâmica, barro, cimento e cachepôs em diversos tamanhos e acabamentos.",
    image:
      "https://images.pexels.com/photos/29520386/pexels-photo-29520386.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "kits",
    name: "Kits de jardinagem",
    description:
      "Combos completos com vaso, planta, substrato e acessórios.",
    image:
      "https://images.pexels.com/photos/6913411/pexels-photo-6913411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "ferramentas",
    name: "Ferramentas",
    description: "Tesouras, pás, regadores, luvas e tudo para o cuidado diário.",
    image:
      "https://images.pexels.com/photos/8543388/pexels-photo-8543388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    slug: "substratos",
    name: "Substratos e materiais",
    description:
      "Substratos, argila expandida, pedriscos e coberturas para montagem.",
    image:
      "https://images.pexels.com/photos/6912838/pexels-photo-6912838.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;
