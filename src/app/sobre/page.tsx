import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, HeartHandshake, Recycle, Sprout, ArrowRight } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: `Conheça a ${site.fullName}: cuidado com plantas, qualidade de produtos e a missão de tornar ambientes mais verdes.`,
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Nossa história</p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-forest sm:text-5xl">
          Cuidamos de plantas.<br />Elas cuidam de você.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-stonegray">
          A {site.fullName} nasceu em um quintal cheio de vasos e virou um viveiro
          completo de plantas, flores, kits e paisagismo.
        </p>
      </header>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/3.2] overflow-hidden rounded-3xl">
            <Image
              src="https://images.pexels.com/photos/7728874/pexels-photo-7728874.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Jardineira plantando mudas no viveiro"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="font-display text-2xl font-semibold text-forest sm:text-3xl">
            Do viveiro para a sua casa, com cuidado em cada etapa
          </h2>
          <p className="mt-4 leading-relaxed text-ink/75">
            Tudo começou com a convicção de que ambientes verdes transformam o humor
            de uma casa. Hoje, selecionamos cada muda nos melhores produtores,
            desenvolvemos vasos e kits pensados para durar, e montamos composições
            com o mesmo carinho que teríamos no nosso próprio jardim.
          </p>
          <p className="mt-4 leading-relaxed text-ink/75">
            Nosso personalizador 3D existe para que você projete seu vaso com
            confiança: o que você vê na tela é exatamente o que preparamos para
            entregar — componente por componente.
          </p>
          <Link href="/monte-seu-vaso" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-forest">
            Experimentar o personalizador <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Sprout className="h-6 w-6" />, t: "Seleção rigorosa", d: "Mudas avaliadas uma a uma: raiz, folha e vigor antes de ir para a loja." },
          { icon: <Leaf className="h-6 w-6" />, t: "Verde de verdade", d: "Catálogo vivo, sazonal e sempre atualizado pelo nosso time de jardinagem." },
          { icon: <HeartHandshake className="h-6 w-6" />, t: "Relação próxima", d: "Atendimento que conhece espécies, luz e rega — não apenas código de produto." },
          { icon: <Recycle className="h-6 w-6" />, t: "Cuidado com o todo", d: "Embalagens de transporte pensadas para proteger a planta e gerar menos resíduo." },
        ].map((v, i) => (
          <Reveal key={v.t} delay={i * 90}>
            <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-sand">
              <span className="inline-flex rounded-2xl bg-primary/10 p-3.5 text-primary">{v.icon}</span>
              <h3 className="font-display mt-4 text-lg font-semibold text-ink">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stonegray">{v.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
