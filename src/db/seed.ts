/**
 * Seed do catálogo — Nature Paisagismo.
 * Dados de demonstração: preços, estoques e textos são fictícios e
 * totalmente editáveis no painel administrativo.
 *
 * Uso: npx tsx src/db/seed.ts
 */
import "dotenv/config";
import { db } from "./index";
import { products, services, users } from "./schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "../lib/auth";

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

type P = typeof products.$inferInsert;

const COLORS = {
  terracota: { name: "Terracota", hex: "#b8754f" },
  creme: { name: "Creme", hex: "#e8dfcc" },
  verde: { name: "Verde oliva", hex: "#477a4b" },
  cimento: { name: "Cimento", hex: "#9c9488" },
  grafite: { name: "Grafite", hex: "#5d5a52" },
  rosa: { name: "Rosa pastel", hex: "#e3b8ad" },
  menta: { name: "Menta", hex: "#a8c3a0" },
  areia: { name: "Areia", hex: "#d9ccb8" },
  branco: { name: "Branco", hex: "#efe9dd" },
  barro: { name: "Barro natural", hex: "#a85f43" },
  ocre: { name: "Ocre", hex: "#c99a5b" },
  madeira: { name: "Madeira", hex: "#8a6b4f" },
};

const SIZES = [
  { id: "p", label: "P — 15 cm", deltaCents: 0 },
  { id: "m", label: "M — 22 cm", deltaCents: 2500 },
  { id: "g", label: "G — 30 cm", deltaCents: 5500 },
];

const catalog: P[] = [
  /* ---------------------------------- PLANTAS ---------------------------------- */
  {
    slug: "zamioculca", name: "Zamioculca", category: "plantas", subcategory: "Folhagem",
    priceCents: 12990, compareAtCents: 15990, stock: 14, bestseller: true, featured: true,
    image: img(18294113), plantModel: "folhagem", inCustomizer: true,
    shortDesc: "A queridinha dos interiores: resistente, brilhante e quase indestrutível.",
    description: "A Zamioculca é perfeita para quem está começando. Tolera baixa luminosidade e esquecimentos na rega, mantendo folhas verdes e brilhantes o ano todo.\n\nVai em cachepô de cerâmica clara, pronta para decorar salas, escritórios e halls.",
    height: "40–60 cm", light: "indireta", water: "2x por mês", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "palmeira-areca", name: "Palmeira Areca", category: "plantas", subcategory: "Palmeira",
    priceCents: 18990, stock: 9, bestseller: true,
    image: img(7193660), plantModel: "palmeira", inCustomizer: true,
    shortDesc: "Volume tropical para salas amplas e varandas iluminadas.",
    description: "De porte escultural, a Palmeira Areca cria aquele ponto verde majestoso em ambientes com boa luz. Suas folhas pendentes trazem movimento e frescor.\n\nVai em vaso de terracota com prato de apoio.",
    height: "1,2–1,6 m", light: "indireta intensa", water: "2x por semana", environment: "ambos", careLevel: "moderado",
  },
  {
    slug: "palmeira-rafis", name: "Palmeira Ráfis", category: "plantas", subcategory: "Palmeira",
    priceCents: 16990, compareAtCents: 19990, stock: 7, isNew: true,
    image: img(7193661), plantModel: "palmeira", inCustomizer: true,
    shortDesc: "Elegante e compacta, com folhas em leque para cantos de luz suave.",
    description: "A Ráfis é a palmeira dos interiores sofisticados: cresce devagar, aceita meia-sombra e dispensa podas frequentes.\n\nVai em vaso de terracota com prato.",
    height: "1,0–1,4 m", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "costela-de-adao", name: "Costela-de-Adão", category: "plantas", subcategory: "Folhagem",
    priceCents: 14990, stock: 12, bestseller: true, featured: true,
    image: img(19923748), plantModel: "folhagem", inCustomizer: true,
    shortDesc: "A clássica Monstera deliciosa, com folhas recortadas impressionantes.",
    description: "Símbolo do décor botânico, a Costela-de-Adão cresce rápido e cria impacto imediato. Gosta de luz indireta e tutor para se apoiar.\n\nVai em vaso de cimento claro.",
    height: "60–90 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "costela-de-adao-gigante", name: "Costela-de-Adão Gigante", category: "plantas", subcategory: "Folhagem",
    priceCents: 28990, stock: 4,
    image: img(17240170), plantModel: "folhagem",
    shortDesc: "Exemplar adulto, já com folhas grandes e fenestradas.",
    description: "Para quem quer o resultado pronto: muda adulta de Monstera deliciosa com copa formada. Ideal ao lado de sofás e portas de vidro.",
    height: "1,4–1,8 m", light: "indireta intensa", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "monstera-adansonii", name: "Monstera Adansonii", category: "plantas", subcategory: "Pendente",
    priceCents: 9990, stock: 11, isNew: true,
    image: img(11062176), plantModel: "pendente", inCustomizer: true,
    shortDesc: "A “costela-de-adão” miúda, perfeita pendente em prateleiras altas.",
    description: "Folhas vazadas delicadas em hastes pendentes — linda em prateleiras, estantes e suportes altos. Prefere luz indireta e substrato levemente úmido.",
    height: "30–50 cm", light: "indireta", water: "2x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "dracena-yuca", name: "Dracena Yuca", category: "plantas", subcategory: "Arbusto",
    priceCents: 11990, stock: 8,
    image: img(11118532), plantModel: "folhagem", inCustomizer: true,
    shortDesc: "Arquitetônica e resistente, com folhas espetadas em roseta.",
    description: "Visual escultural para ambientes modernos. Tolera solos secos e luz filtrada — praticamente uma obra de arte viva.\n\nVai em vaso de cerâmica branca fosca.",
    height: "50–80 cm", light: "indireta intensa", water: "2x por mês", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "suculenta-aloe-vera", name: "Aloe Vera", category: "plantas", subcategory: "Suculenta",
    priceCents: 4990, stock: 18, bestseller: true,
    image: img(7663195), plantModel: "suculenta", inCustomizer: true,
    shortDesc: "Babosa medicinal em vasinho branco — bonita e útil.",
    description: "A Aloe vera gosta de luz e pouca água. Suas folhas guardam o famoso gel calmante usado na pele.\n\nVai em vasinho de cerâmica branca.",
    height: "20–35 cm", light: "direta suave", water: "2x por mês", environment: "ambos", careLevel: "fácil",
  },
  {
    slug: "echeveria-cinza", name: "Echeveria Cinza", category: "plantas", subcategory: "Suculenta",
    priceCents: 3990, stock: 22,
    image: img(305821), plantModel: "suculenta", inCustomizer: true,
    shortDesc: "Roseta perfeita em tom acinzentado, para locais bem iluminados.",
    description: "Suculenta de roseta escultural que pede sol suave e regas espaçadas. Combina com cimento, barro e composições de mesa.",
    height: "10–18 cm", light: "direta suave", water: "2x por mês", environment: "ambos", careLevel: "fácil",
  },
  {
    slug: "suculenta-terracota", name: "Suculenta Terracota", category: "plantas", subcategory: "Suculenta",
    priceCents: 3490, compareAtCents: 4490, stock: 25,
    image: img(5579163), plantModel: "suculenta", inCustomizer: true,
    shortDesc: "Clássica combinada ao vaso de barro: charme imediato.",
    description: "A dupla infalível para presentear: suculenta vigorosa em vasinho de terracota artesanal. Luz boa, pouca água, zero drama.",
    height: "10–15 cm", light: "direta suave", water: "2x por mês", environment: "ambos", careLevel: "fácil",
  },
  {
    slug: "trio-de-cactos", name: "Trio de Cactos", category: "plantas", subcategory: "Cacto",
    priceCents: 8990, stock: 10, featured: true,
    image: img(6745481), plantModel: "cacto", inCustomizer: true,
    shortDesc: "Três formatos diferentes em vasinhos compactos — coleção instantânea.",
    description: "Perfeitos para janelas ensolaradas: três cactos de espécies variadas em vasos de 9 cm. Rega mínima, presença máxima.",
    height: "12–25 cm", light: "direta", water: "1x por mês", environment: "ambos", careLevel: "fácil",
  },
  {
    slug: "cacto-mandacaru", name: "Cacto Mandacaru", category: "plantas", subcategory: "Cacto",
    priceCents: 7990, stock: 6, isNew: true,
    image: img(10384531), plantModel: "cacto", inCustomizer: true,
    shortDesc: "O cacto do sertão brasileiro, cheio de personalidade.",
    description: "Espécie nativa de grande presença cenográfica. Cresce na vertical e adora sol pleno e esquecimento carinhoso.",
    height: "25–40 cm", light: "direta", water: "1x por mês", environment: "externo", careLevel: "fácil",
  },
  {
    slug: "mix-de-suculentas", name: "Mix de Suculentas (6 un.)", category: "plantas", subcategory: "Suculenta",
    priceCents: 9990, compareAtCents: 12990, stock: 15,
    image: img(16771337), plantModel: "suculenta", inCustomizer: true,
    shortDesc: "Seis mini suculentas sortidas para montar seu jardim de mesa.",
    description: "Seleção com seis mini suculentas de cores e texturas variadas, em vasos de 6 cm. Ideal para composições, lembranças e presentes.",
    height: "6–12 cm", light: "direta suave", water: "2x por mês", environment: "ambos", careLevel: "fácil",
  },

  /* ----------------------------------- FLORES ---------------------------------- */
  {
    slug: "orquidea-branca", name: "Orquídea Phalaenopsis Branca", category: "flores", subcategory: "Orquídea",
    priceCents: 13990, stock: 10, bestseller: true, featured: true,
    image: img(10537164), plantModel: "orquidea", inCustomizer: true,
    shortDesc: "Elegância clássica: flores brancas que duram semanas.",
    description: "A Phalaenopsis branca é o presente que sempre encanta. Suas flores duram até 3 meses com cuidados simples: luz indireta e regas semanais por imersão.\n\nVai em cachepô incluso.",
    height: "50–70 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "orquidea-lilas", name: "Orquídea Phalaenopsis Lilás", category: "flores", subcategory: "Orquídea",
    priceCents: 14990, stock: 8,
    image: img(6974685), plantModel: "orquidea", inCustomizer: true,
    shortDesc: "Tom lilás delicado com labelo marcante — presença garantida.",
    description: "Haste dupla em tom lilás-acinzentado, ideal para mesas de jantar e aparadores. Cuidados iguais aos das demais Phalaenopsis.",
    height: "50–70 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "orquidea-rosa", name: "Orquídea Phalaenopsis Rosa", category: "flores", subcategory: "Orquídea",
    priceCents: 13990, stock: 9, isNew: true,
    image: img(11255737), plantModel: "orquidea", inCustomizer: true,
    shortDesc: "Rosa vibrante para presentes cheios de afeto.",
    description: "Flores rosadas abundantes em haste única. Acompanha cachepô e cartão de cuidados.",
    height: "50–70 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "orquidea-amarela", name: "Orquídea Amarela", category: "flores", subcategory: "Orquídea",
    priceCents: 14990, stock: 7,
    image: img(31582039), plantModel: "orquidea", inCustomizer: true,
    shortDesc: "Ilumina qualquer canto com flores de amarelo solar.",
    description: "Alegria em forma de orquídea: flores amarelas de longa duração, com botões adicionais para abrir nos próximos dias.",
    height: "50–70 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "orquidea-rosa-premium", name: "Arranjo Orquídea Premium", category: "flores", subcategory: "Arranjo",
    priceCents: 22990, compareAtCents: 26990, stock: 5, featured: true,
    image: img(36149585), plantModel: "orquidea", inCustomizer: true,
    shortDesc: "Composição alta com hastes duplas e folhagens de apoio.",
    description: "Arranjo de presença para ocasiões especiais: orquídeas rosadas em hastes duplas com folhagens ornamentais em cachepô decorativo.",
    height: "70–90 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "orquidea-suspensa", name: "Orquídea Suspensa em Cuia", category: "flores", subcategory: "Orquídea",
    priceCents: 11990, stock: 6,
    image: img(30163091), plantModel: "pendente", inCustomizer: true,
    shortDesc: "Para pendurar: flores em cuia de fibra com corrente.",
    description: "Variação pendente para varandas cobertas e pergolados. Cuia de fibra de coco com corrente inclusa.",
    height: "40–60 cm", light: "indireta", water: "1x por semana", environment: "ambos", careLevel: "moderado",
  },
  {
    slug: "dupla-de-orquideas", name: "Dupla de Orquídeas com Regador", category: "flores", subcategory: "Conjunto",
    priceCents: 24990, stock: 4,
    image: img(7461838), plantModel: "orquidea",
    shortDesc: "Duas orquídeas + regador de metal: o kit dos colecionadores.",
    description: "Conjunto presenteável com duas Phalaenopsis em tons complementares e regador de bico fino para a rega correta.",
    height: "50–70 cm", light: "indireta", water: "1x por semana", environment: "interno", careLevel: "moderado",
  },
  {
    slug: "buque-rosas-hortensias", name: "Buquê Rosas & Hortênsias", category: "flores", subcategory: "Buquê",
    priceCents: 12990, stock: 12, bestseller: true,
    image: img(38438337), plantModel: "flores", inCustomizer: true,
    shortDesc: "Romântico e volumoso, montado na hora pelo nosso florista.",
    description: "Rosas frescas com hortênsias e folhagens nobres, montado no dia da entrega. Acompanha embrulho em papel kraft e laço.",
    height: "45–55 cm", light: "indireta", water: "trocar a água a cada 2 dias", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "buque-classico-de-rosas", name: "Buquê Clássico de Rosas (12)", category: "flores", subcategory: "Buquê",
    priceCents: 11990, stock: 14,
    image: img(38367275), plantModel: "flores", inCustomizer: true,
    shortDesc: "Doze rosas selecionadas em tons rosé — o clássico infalível.",
    description: "Uma dúzia de rosas de hastes longas com gypsophila, no embrulho tradicional. Para pedidos, desculpas e celebrações.",
    height: "50–60 cm", light: "indireta", water: "trocar a água a cada 2 dias", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "buque-campestre", name: "Buquê Campestre", category: "flores", subcategory: "Buquê",
    priceCents: 9490, compareAtCents: 10990, stock: 10, isNew: true,
    image: img(28613094), plantModel: "flores", inCustomizer: true,
    shortDesc: "Flores do campo em tons rosados com muito verde — leve e afetivo.",
    description: "Mix campestre com flores de corte da estação e folhagens volumosas. Estética despojada, perfume de jardim.",
    height: "40–50 cm", light: "indireta", water: "trocar a água a cada 2 dias", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "arranjo-primavera", name: "Arranjo Primavera", category: "flores", subcategory: "Arranjo",
    priceCents: 10990, stock: 8,
    image: img(36487710), plantModel: "flores", inCustomizer: true,
    shortDesc: "Centro de mesa colorido com rosas, hortênsias e flores de estação.",
    description: "Arranjo baixo e cheio, perfeito para centros de mesa e aparadores. Vai em recipiente de vidro incluso.",
    height: "25–35 cm", light: "indireta", water: "trocar a água a cada 2 dias", environment: "interno", careLevel: "fácil",
  },
  {
    slug: "buque-champanhe", name: "Buquê Champanhe", category: "flores", subcategory: "Buquê",
    priceCents: 9990, stock: 9,
    image: img(15358707), plantModel: "flores", inCustomizer: true,
    shortDesc: "Rosas em tom champanhe embrulhadas em papel craft — discretas e chiques.",
    description: "Tons suaves para gestos elegantes: rosas champanhe com folhagem de eucalipto em embrulho artesanal.",
    height: "45–55 cm", light: "indireta", water: "trocar a água a cada 2 dias", environment: "interno", careLevel: "fácil",
  },

  /* ----------------------------------- VASOS ----------------------------------- */
  {
    slug: "vaso-ceramico-esmaltado", name: "Vaso Cerâmico Esmaltado", category: "vasos", subcategory: "Cerâmica",
    priceCents: 8990, stock: 16, bestseller: true, featured: true,
    image: img(29520386), potStyle: "classico", inCustomizer: true,
    potColors: [COLORS.terracota, COLORS.creme, COLORS.verde], sizes: SIZES,
    shortDesc: "Clássico de boca ampla, esmalte artesanal em três cores.",
    description: "Cerâmica esmaltada produzida artesanalmente, com furo de drenagem e acabamento acetinado. Combina com praticamente todas as espécies do catálogo.",
    height: "15–30 cm", environment: "ambos",
  },
  {
    slug: "vaso-decorativo-alto", name: "Vaso Alto Decorativo", category: "vasos", subcategory: "Cimento",
    priceCents: 11990, stock: 9,
    image: img(36132363), potStyle: "alto", inCustomizer: true,
    potColors: [COLORS.cimento, COLORS.terracota, COLORS.areia], sizes: SIZES,
    shortDesc: "Perfil alto e esguio para plantas de porte e cantos vazios.",
    description: "Cimento vazado com acabamento liso, ideal para palmeiras e dracenas. Estrutura leve com base estável.",
    height: "40–60 cm", environment: "ambos",
  },
  {
    slug: "cachepo-pastel", name: "Cachepô Pastel", category: "vasos", subcategory: "Cerâmica decorativa",
    priceCents: 6990, compareAtCents: 8490, stock: 14, isNew: true,
    image: img(16728140), potStyle: "bojo", inCustomizer: true,
    potColors: [COLORS.rosa, COLORS.menta, COLORS.creme], sizes: SIZES,
    shortDesc: "Tons suaves para interiores delicados — sem furo, uso com cachepô interno.",
    description: "Cachepô bojudo em tons pastel foscos. Por não ter furo, é ideal como revestimento de vasos de cultivo.",
    height: "15–30 cm", environment: "interno",
  },
  {
    slug: "vaso-face", name: "Vaso Face Ceramista", category: "vasos", subcategory: "Cerâmica artesanal",
    priceCents: 5990, stock: 11,
    image: img(35669377), potStyle: "classico", inCustomizer: true,
    potColors: [COLORS.branco], sizes: [SIZES[0], SIZES[1]],
    shortDesc: "Peça de ceramista carioca com rosto ilustrado — puro bom humor.",
    description: "Série limitada de vasos com ilustração de rosto, modelados e pintados à mão. Furo de drenagem incluso.",
    height: "15–22 cm", environment: "interno",
  },
  {
    slug: "vaso-rustico-de-barro", name: "Vaso Rústico de Barro", category: "vasos", subcategory: "Barro",
    priceCents: 5490, stock: 20, bestseller: true,
    image: img(36058908), potStyle: "bojo", inCustomizer: true,
    potColors: [COLORS.barro, COLORS.terracota], sizes: SIZES,
    shortDesc: "O tradicional: barro poroso que respira e a planta agradece.",
    description: "Barro queimado artesanal com porosidade natural — regula a umidade e protege as raízes. Perfeito para suculentas e ervas.",
    height: "15–30 cm", environment: "ambos",
  },
  {
    slug: "vaso-cimento-geometrico", name: "Vaso Cimento Geométrico", category: "vasos", subcategory: "Cimento",
    priceCents: 8490, stock: 12, featured: true,
    image: img(31578568), potStyle: "geometrico", inCustomizer: true,
    potColors: [COLORS.cimento, COLORS.grafite, COLORS.areia], sizes: SIZES,
    shortDesc: "Faces facetadas e presença contemporânea para o décor urbano.",
    description: "Cimento moldado em geometria facetada, com selante interno e furo de drenagem. O preferido para cactos e suculentas imponentes.",
    height: "15–30 cm", environment: "ambos",
  },
  {
    slug: "vaso-tigela-colorido", name: "Vaso Tigela Colorido", category: "vasos", subcategory: "Plástico moderno",
    priceCents: 4490, compareAtCents: 5990, stock: 18,
    image: img(37268211), potStyle: "tigela", inCustomizer: true,
    potColors: [COLORS.ocre, COLORS.verde, COLORS.creme], sizes: SIZES,
    shortDesc: "Leve, colorido e perfeito para jardins de suculentas.",
    description: "Tigela de perfil baixo em polipropileno fosco, alta resistência a sol e chuva. Ótimo para composições de mesa.",
    height: "10–22 cm", environment: "ambos",
  },
  {
    slug: "jardineira-de-madeira", name: "Jardineira de Madeira", category: "vasos", subcategory: "Jardineira",
    priceCents: 9990, stock: 7,
    image: img(11821970), potStyle: "tigela", inCustomizer: true,
    potColors: [COLORS.madeira], sizes: [SIZES[1], SIZES[2]],
    shortDesc: "Caixote de reflorestamento envernizado para composições corridas.",
    description: "Jardineira retangular em madeira de reflorestamento com impermeabilização interna. Ideal para ervas, flores de temporada e hortas compactas.",
    height: "22–30 cm", environment: "externo",
  },

  /* ------------------------------------ KITS ----------------------------------- */
  {
    slug: "kit-comecei-a-plantar", name: "Kit Comecei a Plantar", category: "kits", subcategory: "Iniciantes",
    priceCents: 15990, compareAtCents: 18990, stock: 12, bestseller: true, featured: true,
    image: img(4507751),
    kitItems: [
      { name: "Vaso de barro P com prato", qty: 1 },
      { name: "Suculenta ou mudinha de estação", qty: 1 },
      { name: "Substrato premium 1 kg", qty: 1 },
      { name: "Pá de mão e guia ilustrado", qty: 1 },
    ],
    shortDesc: "O primeiro passo perfeito: vaso, muda, substrato e ferramenta — com guia.",
    description: "Pensado para quem nunca plantou: vaso de barro com prato, muda resistente de estação, substrato premium, pá de mão e um guia ilustrado de montagem e cuidados.\n\nEm 15 minutos você planta, decide o lugar e ganha um novo hobby.",
  },
  {
    slug: "kit-meu-cantinho-verde", name: "Kit Meu Cantinho Verde", category: "kits", subcategory: "Interiores",
    priceCents: 18990, compareAtCents: 21990, stock: 10, featured: true,
    image: img(6913411),
    kitItems: [
      { name: "Vaso cimento geométrico M", qty: 1 },
      { name: "Planta ornamental de interior", qty: 1 },
      { name: "Substrato + argila expandida", qty: 1 },
      { name: "Pedrisco decorativo 500 g", qty: 1 },
    ],
    shortDesc: "Tudo para montar aquele cantinho Instagramável em casa.",
    description: "Composição completa para interiores: vaso de cimento geométrico, muda ornamental selecionada para ambientes internos, substrato, drenagem e acabamento em pedrisco.\n\nSiga o passo a passo ou solicite a montagem pela nossa equipe.",
  },
  {
    slug: "kit-decoracao-premium", name: "Kit Decoração Premium", category: "kits", subcategory: "Premium",
    priceCents: 24990, compareAtCents: 28990, stock: 6, isNew: true,
    image: img(5942507),
    kitItems: [
      { name: "Três vasos em tons coordenados", qty: 1 },
      { name: "Plantas de interior variadas", qty: 3 },
      { name: "Cachepôs de fibra natural", qty: 2 },
      { name: "Substrato premium 2 kg", qty: 1 },
    ],
    shortDesc: "Três vasos coordenados + plantas variadas para uma parede verde completa.",
    description: "Curadoria de tres vasos em tons coordenados com espécies complementares de alturas distintas — o arranjo de parede/estante pronto em uma caixa.",
  },
  {
    slug: "kit-jardim-tropical", name: "Kit Jardim Tropical", category: "kits", subcategory: "Externos",
    priceCents: 22990, compareAtCents: 26990, stock: 8,
    image: img(12143035),
    kitItems: [
      { name: "Mudas tropicais variadas", qty: 3 },
      { name: "Jardineira de madeira G", qty: 1 },
      { name: "Substrato para jardim 5 kg", qty: 1 },
      { name: "Casca de pinus decorativa 1 L", qty: 1 },
    ],
    shortDesc: "Folhagens tropicais volumosas para varandas e áreas externas.",
    description: "Seleção de espécies tropicais de folhas grandes para criar aquele clima de resort na varanda: mudas, jardineira de madeira, substrato de jardim e cobertura de casca.",
  },

  /* -------------------------------- FERRAMENTAS -------------------------------- */
  {
    slug: "conjunto-ferramentas-4-pecas", name: "Conjunto de Ferramentas 4 Peças", category: "ferramentas", subcategory: "Ferramentas",
    priceCents: 12990, stock: 13, bestseller: true,
    image: img(7655612),
    shortDesc: "Pá, rastelo, garfo e transplanter em aço com cabo de madeira.",
    description: "Kit com as quatro ferramentas essenciais de bancada: pá, rastelo, garfo e transplanter. Aço carbono com cabos de madeira envernizada.",
  },
  {
    slug: "luvas-de-jardinagem", name: "Luvas de Jardinagem", category: "ferramentas", subcategory: "Proteção",
    priceCents: 3990, stock: 20,
    image: img(7655610),
    shortDesc: "Algodão com palma emborrachada — proteção sem perder o tato.",
    description: "Luvas em algodão respirável com revestimento emborrachado na palma. Tamanho único, laváveis.",
  },
  {
    slug: "pa-e-rastelo-de-mesa", name: "Pá e Rastelo de Mesa", category: "ferramentas", subcategory: "Ferramentas",
    priceCents: 5990, stock: 15,
    image: img(11337256),
    shortDesc: "Dupla compacta para plantios de apartamento.",
    description: "Pá e rastelo de tamanho reduzido, perfeitos para vasos e jardineiras. Aço inox com empunhadura anatômica.",
  },
  {
    slug: "tesoura-de-poda-profissional", name: "Tesoura de Poda Profissional", category: "ferramentas", subcategory: "Ferramentas",
    priceCents: 8990, compareAtCents: 10990, stock: 9, isNew: true,
    image: img(8543388),
    shortDesc: "Corte bypass preciso para podas limpas que cicatrizam rápido.",
    description: "Lâmina de aço japonês com corte bypass de precisão, mola de retorno e trava de segurança. Ideal para rosas, arbustos e colheitas.",
  },
  {
    slug: "kit-vasos-biodegradaveis", name: "Kit de Vasos Biodegradáveis (12 un.)", category: "ferramentas", subcategory: "Acessórios",
    priceCents: 4990, stock: 16,
    image: img(8543400),
    shortDesc: "Copinhos de fibra para semear e transplantar sem choque de raiz.",
    description: "Doze vasos de fibra biodegradável de 8 cm para semeaduras: planta-se o vaso inteiro, evitando o estresse do transplante.",
  },

  /* --------------------------------- SUBSTRATOS -------------------------------- */
  {
    slug: "substrato-premium-2kg", name: "Substrato Premium 2 kg", category: "substratos", subcategory: "Substrato",
    priceCents: 2990, stock: 30, bestseller: true,
    image: img(4505143), materialKind: "substrato", inCustomizer: true,
    shortDesc: "Mistura aérea com fibra de coco, turfa e húmus — pronta para uso.",
    description: "Blend leve e drenante com fibra de coco, turfa, húmus de minhoca e perlita. Serve para a maioria das ornamentais de vaso.\n\nEmbalagem de 2 kg — rende 1 vaso G ou 2 vasos M.",
  },
  {
    slug: "argila-expandida-1kg", name: "Argila Expandida 1 kg", category: "substratos", subcategory: "Drenagem",
    priceCents: 2490, stock: 28,
    image: img(1022923), materialKind: "drenagem", inCustomizer: true,
    shortDesc: "Camada de fundo que protege as raízes do excesso de água.",
    description: "Esferas leves de argila para a camada de drenagem dos vasos. Evita encharcamento e apodrecimento radicular.\n\nSaco de 1 kg — suficiente para 1 vaso G.",
  },
  {
    slug: "pedrisco-decorativo-1kg", name: "Pedrisco Decorativo 1 kg", category: "substratos", subcategory: "Cobertura",
    priceCents: 1990, stock: 32,
    image: img(6912838), materialKind: "cobertura", inCustomizer: true,
    shortDesc: "Acabamento claro sobre o substrato: bonito e anti-mosquito.",
    description: "Pedrisco branco decorativo para cobrir o substrato: dá acabamento profissional, reduz evaporação e dificulta a proliferação de mosquitos.\n\nSaco de 1 kg.",
  },
  {
    slug: "casca-de-pinus-1l", name: "Casca de Pinus 1 L", category: "substratos", subcategory: "Cobertura",
    priceCents: 2290, stock: 24,
    image: img(7728121), materialKind: "cobertura", inCustomizer: true,
    shortDesc: "Cobertura orgânica que as orquídeas amam.",
    description: "Casca de pinus triturada e tratada: cobertura viva que retém umidade leve e é o substrato clássico para orquídeas.\n\nEmbalagem de 1 L.",
  },
];

const serviceList = [
  {
    slug: "montagem-de-vasos",
    name: "Montagem de vasos e composições",
    description: "Nossa equipe monta seu vaso personalizado com técnica de drenagem profissional, torrão acomodado e acabamento impecável.",
    image: img(7728625),
    priceLabel: "A partir de R$ 39,90 por vaso",
    area: "Loja física e retirada agendada",
    active: true,
  },
  {
    slug: "entrega-programada",
    name: "Entrega programada de plantas",
    description: "Escolha o dia e a janela de horário. Transporte em caixas ventiladas com amarração própria para torrões.",
    image: img(3894245),
    priceLabel: "Conforme cep — grátis acima de R$ 299",
    area: "Cotia, Granja Viana, Barueri e Osasco",
    active: true,
  },
  {
    slug: "orientacao-de-plantas",
    name: "Orientação para escolha de plantas",
    description: "Conversa de 30 minutos (online ou na loja) para mapear luz, rotina e estilo — e indicar as espécies certas para você.",
    image: img(6913081),
    priceLabel: "R$ 59 — revertido em compras",
    area: "Online para todo o Brasil",
    active: true,
  },
  {
    slug: "manutencao-de-jardins",
    name: "Manutenção de plantas e jardins",
    description: "Visitas periódicas para poda, adubação, controle de pragas e replantios. Pacotes mensais para casas e empresas.",
    image: img(7728874),
    priceLabel: "Planos a partir de R$ 249/mês",
    area: "Até 25 km da loja",
    active: true,
  },
  {
    slug: "consultoria-de-paisagismo",
    name: "Consultoria de paisagismo",
    description: "Projeto completo com estudo de espécies, layout, lista de compras e acompanhamento de execução para varandas e jardins.",
    image: img(27910086),
    priceLabel: "Sob consulta",
    area: "Região metropolitana de SP",
    active: true,
  },
  {
    slug: "projetos-corporativos",
    name: "Paisagismo corporativo",
    description: "Verde para escritórios e recepções: composições de grande porte com contrato de manutenção integrado.",
    image: img(14020920),
    priceLabel: "Sob consulta",
    area: "São Paulo capital",
    active: false,
  },
];

async function main() {
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products);
  if (Number(n) > 0) {
    console.log(`Catálogo já possui ${n} produtos — seed ignorado.`);
  } else {
    await db.insert(products).values(catalog);
    console.log(`✔ ${catalog.length} produtos inseridos.`);
  }

  const [{ n: ns }] = await db.select({ n: sql<number>`count(*)` }).from(services);
  if (Number(ns) === 0) {
    await db.insert(services).values(serviceList);
    console.log(`✔ ${serviceList.length} serviços inseridos.`);
  }

  const [{ n: nu }] = await db.select({ n: sql<number>`count(*)` }).from(users);
  if (Number(nu) === 0) {
    await db.insert(users).values([
      {
        name: "Administrador",
        email: "admin@naturepaisagismo.com",
        passwordHash: hashPassword("admin123"),
        role: "admin",
      },
      {
        name: "Cliente Exemplo",
        email: "cliente@exemplo.com",
        passwordHash: hashPassword("cliente123"),
        role: "customer",
      },
    ]);
    console.log("✔ Usuários criados (admin@naturepaisagismo.com / admin123).");
  }

  console.log("Seed concluído.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
