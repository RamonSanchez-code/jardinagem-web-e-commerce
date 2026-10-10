import Link from "next/link";
import Image from "next/image";
import {
  Truck, Leaf, Package, MessageCircle, ArrowRight, Hammer, Gift, Sparkles,
  Flower2, Scissors, Shovel, Layers, Sprout,
} from "lucide-react";
import { HeroLoader } from "@/components/hero3d/HeroLoader";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getBenefits, getProducts, getNewArrivals, getActiveServices } from "@/lib/queries";
import { categories, site } from "@/lib/site";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  truck: <Truck className="h-5 w-5" />,
  leaf: <Leaf className="h-5 w-5" />,
  package: <Package className="h-5 w-5" />,
  message: <MessageCircle className="h-5 w-5" />,
};

const RECEIVE_OPTIONS = [
  {
    title: "Kit para montar",
    text: "Você recebe o vaso, a planta, o substrato e os acessórios — e monta tudo do seu jeito.",
    image:
      "https://images.pexels.com/photos/8543398/pexels-photo-8543398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    href: "/monte-seu-vaso",
    cta: "Começar a montar",
    icon: <Hammer className="h-4 w-4" />,
  },
  {
    title: "Kit montado",
    text: "Composição pronta, montada pela nossa equipe de jardinagem, conforme a disponibilidade.",
    image:
      "https://images.pexels.com/photos/7461838/pexels-photo-7461838.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    href: "/loja?categoria=kits",
    cta: "Ver kits",
    icon: <Gift className="h-4 w-4" />,
  },
  {
    title: "Vaso pronto",
    text: "Escolha a planta já combinada com o vaso ideal, pronta para decorar seu ambiente.",
    image:
      "https://images.pexels.com/photos/7193660/pexels-photo-7193660.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    href: "/loja?categoria=vasos",
    cta: "Ver vasos",
    icon: <Sparkles className="h-4 w-4" />,
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  plantas: <Sprout className="h-5 w-5" />,
  flores: <Flower2 className="h-5 w-5" />,
  vasos: <Layers className="h-5 w-5" />,
  kits: <Package className="h-5 w-5" />,
  ferramentas: <Scissors className="h-5 w-5" />,
  substratos: <Shovel className="h-5 w-5" />,
};

export default async function HomePage() {
  const [benefits, kits, bestsellers, novidades, services] = await Promise.all([
    getBenefits(),
    getProducts({ category: "kits", limit: 4 }),
    getProducts({ bestseller: true, limit: 8 }),
    getNewArrivals(8),
    getActiveServices(),
  ]);
  const destaques = bestsellers.length ? bestsellers : await getProducts({ limit: 8 });

  return (
    <>
      {/* ---------------------------- Experiência imersiva ---------------------------- */}
      <HeroLoader />

      <div id="conteudo" className="scroll-mt-20">
        {/* ------------------------------ Faixa de benefícios --------------------------- */}
        <section className="border-b border-sand bg-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80} className="flex items-start gap-3.5">
                <span className="rounded-full bg-primary/10 p-3 text-primary">
                  {BENEFIT_ICONS[b.icon] ?? <Leaf className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">{b.title}</h3>
                  <p className="mt-1 text-[0.8rem] leading-relaxed text-stonegray">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* -------------------------- Escolha como deseja receber ------------------------ */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Do jeito que você preferir</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">
              Escolha como deseja receber
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {RECEIVE_OPTIONS.map((o, i) => (
              <Reveal key={o.title} delay={i * 110}>
                <Link
                  href={o.href}
                  className="group relative block h-80 overflow-hidden rounded-3xl ring-1 ring-sand transition duration-300 hover:shadow-2xl hover:shadow-forest/15"
                >
                  <Image
                    src={o.image}
                    alt={o.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                    <h3 className="font-display text-2xl font-semibold">{o.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream/85">{o.text}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cream underline-offset-4 group-hover:underline">
                      {o.icon} {o.cta}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------------ Grade de categorias ---------------------------- */}
        <section className="bg-white/60 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Catálogo</p>
                <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">
                  Explore nossas categorias
                </h2>
              </div>
              <Link href="/loja" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">
                Ver toda a loja <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c, i) => (
                <Reveal key={c.slug} delay={(i % 4) * 70}>
                  <Link
                    href={`/loja?categoria=${c.slug}`}
                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-sand"
                  >
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-cream">
                      <div>
                        <span className="text-moss">{CATEGORY_ICONS[c.slug]}</span>
                        <h3 className="font-display mt-1.5 text-base font-semibold leading-tight sm:text-lg">{c.name}</h3>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                </Reveal>
              ))}
              <Reveal delay={140}>
                <Link
                  href="/monte-seu-vaso"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-terracotta/40"
                >
                  <Image
                    src="/img/monte-seu-vaso-banner.jpg"
                    alt="Monte seu vaso personalizado"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-terracotta-dark/90 via-terracotta/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                    <h3 className="font-display text-base font-semibold leading-tight sm:text-lg">Monte seu vaso</h3>
                    <p className="mt-1 text-[0.7rem] text-cream/85">Personalizador 3D</p>
                  </div>
                </Link>
              </Reveal>
              <Reveal delay={210}>
                <Link
                  href="/loja"
                  className="group flex aspect-[4/3] flex-col items-start justify-between rounded-2xl bg-forest p-4 text-cream ring-1 ring-forest"
                >
                  <Sparkles className="h-6 w-6 text-moss" />
                  <div>
                    <h3 className="font-display text-base font-semibold leading-tight sm:text-lg">
                      Toda a coleção
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[0.72rem] text-cream/75">
                      Ver todos os produtos <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ----------------------------- Banner personalização --------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-forest ring-1 ring-sand">
              <div className="relative grid items-center gap-0 lg:grid-cols-2">
                <div className="relative z-10 p-8 sm:p-12 lg:p-14">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-moss">Personalizador 3D</p>
                  <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-cream sm:text-4xl">
                    Monte o seu vaso do seu jeito!
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80 sm:text-base">
                    Escolha o vaso, a planta e os materiais. Personalize sua composição,
                    visualize em 3D e receba em casa — ou escolha uma opção de montagem,
                    conforme os serviços disponíveis.
                  </p>
                  <Link
                    href="/monte-seu-vaso"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
                  >
                    Montar meu vaso <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="relative h-64 lg:h-[26rem]">
                  <Image
                    src="/img/monte-seu-vaso-banner.jpg"
                    alt="Vaso de cerâmica com planta tropical cercado de folhas"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/20 to-transparent max-lg:bg-gradient-to-t" />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* --------------------------------- Kits especiais ------------------------------ */}
        {kits.length > 0 && (
          <section className="bg-white/60 py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Combos</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">Kits especiais</h2>
                  <p className="mt-2 max-w-lg text-sm text-stonegray">
                    Tudo incluído: vaso, plantas, substrato e acessórios — com economia em relação à compra avulsa.
                  </p>
                </div>
                <Link href="/loja?categoria=kits" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">
                  Ver todos os kits <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {kits.map((k, i) => (
                  <Reveal key={k.id} delay={(i % 4) * 80}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-forest text-cream ring-1 ring-forest transition hover:shadow-2xl hover:shadow-forest/25">
                      <Link href={`/produto/${k.slug}`} className="relative block aspect-square overflow-hidden">
                        <Image
                          src={k.image}
                          alt={k.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <Link href={`/produto/${k.slug}`}>
                          <h3 className="font-display text-lg font-semibold leading-snug">{k.name}</h3>
                        </Link>
                        <p className="mt-1.5 line-clamp-2 text-[0.8rem] text-cream/70">{k.shortDesc}</p>
                        {k.kitItems && k.kitItems.length > 0 && (
                          <ul className="mt-3 space-y-1 text-[0.72rem] text-cream/80">
                            {k.kitItems.slice(0, 4).map((it) => (
                              <li key={it.name} className="flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-terracotta" />
                                {it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div>
                            {k.compareAtCents && (
                              <p className="text-[0.68rem] text-cream/50 line-through">{brl(k.compareAtCents)}</p>
                            )}
                            <p className="text-lg font-bold">{brl(k.priceCents)}</p>
                          </div>
                          <AddToCartButton
                            item={{
                              kind: "produto",
                              productId: k.id,
                              slug: k.slug,
                              name: k.name,
                              image: k.image,
                              unitPriceCents: k.priceCents,
                            }}
                            compact
                          />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------- Mais vendidos -------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Catálogo real</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">
                Os mais vendidos
              </h2>
            </div>
            <Link href="/loja" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destaques.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 70}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* --------------------------------- Novidades ----------------------------------- */}
        {novidades.length > 0 && (
          <section className="bg-white/60 py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Acabou de chegar</p>
                <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">Novidades</h2>
              </Reveal>
              <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]">
                <div className="flex gap-5">
                  {novidades.map((p) => (
                    <div key={p.id} className="w-64 shrink-0 sm:w-72">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------- Serviços ----------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Além da loja</p>
              <h2 className="font-display mt-3 text-3xl font-semibold text-forest sm:text-4xl">
                Serviços de jardinagem
              </h2>
            </div>
            <Link href="/servicos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3">
              Todos os serviços <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {services.slice(0, 3).map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <Link
                  href="/servicos"
                  className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-sand transition hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={s.image || "/img/monte-seu-vaso-banner.jpg"}
                      alt={s.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink">{s.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-stonegray">{s.description}</p>
                    <p className="mt-3 text-sm font-semibold text-primary">{s.priceLabel}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------------- Sobre -------------------------------------- */}
        <section className="bg-forest py-16 text-cream lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.pexels.com/photos/7728108/pexels-photo-7728108.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Jardineira plantando mudas com as mãos"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-moss">Nossa história</p>
              <h2 className="font-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                Cuidamos de plantas. Elas cuidam de você.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80">
                A {site.fullName} nasceu da paixão por transformar espaços em lugares
                mais vivos. Selecionamos cada muda, cada vaso e cada material com o
                mesmo cuidado que teríamos no nosso próprio jardim — e entregamos
                tudo pronto para o seu.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  ["+1.200", "composições entregues"],
                  ["85", "espécies no viveiro"],
                  ["9 anos", "de paisagismo"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="font-display text-2xl font-semibold text-terracotta sm:text-3xl">{n}</p>
                    <p className="mt-1 text-[0.72rem] leading-snug text-cream/70">{l}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/sobre"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-cream/40 px-7 py-3 text-sm font-semibold transition hover:bg-cream/10"
              >
                Conhecer a marca <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
