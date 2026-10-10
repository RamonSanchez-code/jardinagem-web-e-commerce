import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, ArrowDown } from "lucide-react";
import { getActiveServices } from "@/lib/queries";
import { ServiceForm } from "@/components/site/ServiceForm";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Serviços de jardinagem",
  description: "Montagem de vasos e kits, entrega programada, manutenção de jardins e consultoria de paisagismo.",
};

export const dynamic = "force-dynamic";

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico } = await searchParams;
  const services = await getActiveServices();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Além da loja</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">
          Serviços de jardinagem e paisagismo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stonegray sm:text-base">
          Só oferecemos o que está habilitado e disponível na sua região — consulte
          condições, áreas atendidas e valores abaixo.
        </p>
      </header>

      {services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sand-dark bg-white/60 p-16 text-center">
          <p className="font-display text-xl font-semibold text-ink">Nenhum serviço disponível no momento</p>
          <p className="mt-2 text-sm text-stonegray">Fale conosco pelo formulário abaixo para saber quando novos serviços serão habilitados.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 90}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-sand transition hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-forest/90 px-3.5 py-1.5 text-[0.68rem] font-bold text-cream backdrop-blur-sm">
                    {s.priceLabel}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-semibold text-ink">{s.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stonegray">{s.description}</p>
                  {s.area && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-leaf">
                      <MapPin className="h-3.5 w-3.5" /> {s.area}
                    </p>
                  )}
                  <a
                    href="#solicitar"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-3 text-xs font-semibold text-cream transition hover:bg-primary"
                  >
                    Solicitar orçamento <ArrowDown className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      <div id="solicitar" className="mx-auto mt-16 max-w-2xl scroll-mt-32">
        <Reveal>
          <ServiceForm
            services={services.map((s) => ({ id: s.id, name: s.name }))}
            preselect={servico}
            title="Solicite informações ou agendamento"
          />
        </Reveal>
      </div>
    </div>
  );
}
