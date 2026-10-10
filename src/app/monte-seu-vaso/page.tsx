import type { Metadata } from "next";
import { getCustomizerData } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Customizer } from "./Customizer";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Monte seu vaso",
  description:
    "Personalizador 3D: escolha o vaso, os materiais e a planta, visualize sua composição em 3D e receba em casa.",
};

export const dynamic = "force-dynamic";

export default async function MonteSeuVasoPage({
  searchParams,
}: {
  searchParams: Promise<{ vaso?: string }>;
}) {
  const { vaso } = await searchParams;
  const [data, session] = await Promise.all([getCustomizerData(), getSession()]);
  const initialPotId = vaso ? Number(vaso) || undefined : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <Reveal className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Personalizador 3D</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">
          Monte seu vaso, do seu jeito
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stonegray sm:text-base">
          Em quatro passos simples: escolha o vaso, os materiais e a planta — e veja sua
          criação ganhar forma em 3D. Os preços são calculados a partir dos componentes
          escolhidos e confirmados no servidor antes do pedido.
        </p>
      </Reveal>

      {data.pots.length === 0 || data.plants.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sand-dark bg-white/60 p-16 text-center">
          <p className="font-display text-xl font-semibold text-ink">Personalizador indisponível no momento</p>
          <p className="mt-2 text-sm text-stonegray">
            Estamos atualizando as opções de vasos e plantas. Volte em breve.
          </p>
        </div>
      ) : (
        <Customizer
          pots={JSON.parse(JSON.stringify(data.pots))}
          materials={JSON.parse(JSON.stringify(data.materials))}
          plants={JSON.parse(JSON.stringify(data.plants))}
          initialPotId={initialPotId}
          loggedIn={!!session}
        />
      )}

      <Reveal className="mt-14">
        <p className="rounded-2xl bg-sand/50 px-5 py-4 text-center text-xs text-stonegray">
          Os valores exibidos durante a montagem são referências calculadas a partir do catálogo.
          O carrinho preserva todos os componentes e o total é revalidado no servidor antes do pedido.
        </p>
      </Reveal>
    </div>
  );
}
