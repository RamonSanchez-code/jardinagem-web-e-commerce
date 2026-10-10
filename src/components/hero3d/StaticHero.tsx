import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Leaf } from "lucide-react";
import { site } from "@/lib/site";

/** Hero estático: fallback para prefers-reduced-motion, telas pequenas e dispositivos sem WebGL forte */
export function StaticHero({ loading = false }: { loading?: boolean }) {
  return (
    <section className="relative flex h-[100svh] min-h-[36rem] items-center overflow-hidden bg-forest">
      <Image
        src="/img/apartamento-fallback.jpg"
        alt="Varanda de apartamento repleta de vasos e plantas tropicais, com porta aberta revelando um interior aconchegante e verde"
        fill
        priority
        className="animate-kenburns object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/50 to-forest/10" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-forest/70 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl text-cream">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cream/30 bg-forest/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" /> {site.fullName}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85 sm:text-lg">
            {site.taglineSub}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/loja?categoria=plantas"
              className="rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-forest transition hover:bg-white"
            >
              Ver plantas
            </Link>
            <Link
              href="/monte-seu-vaso"
              className="rounded-full border border-cream/50 px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-cream/10"
            >
              Monte seu vaso
            </Link>
          </div>
          {loading && (
            <p className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream/60">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cream/70" />
              Preparando o jardim...
            </p>
          )}
        </div>
      </div>
      {!loading && (
        <a
          href="#conteudo"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/70 transition hover:text-cream"
          aria-label="Rolar para o conteúdo"
        >
          <ChevronDown className="h-7 w-7 animate-scroll-hint" />
        </a>
      )}
    </section>
  );
}
