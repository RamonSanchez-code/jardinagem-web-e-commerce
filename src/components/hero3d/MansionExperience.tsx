"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Leaf } from "lucide-react";
import { MansionWorld } from "./MansionScene";
import { StaticHero } from "./StaticHero";
import { site } from "@/lib/site";

type Caption = { a: number; b: number; align: string; node: React.ReactNode };

const btn =
  "rounded-full px-7 py-3.5 text-sm font-semibold transition pointer-events-auto";
const chip =
  "rounded-full border border-forest/20 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-forest backdrop-blur-sm";

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function MansionExperience() {
  const [mode, setMode] = useState<"check" | "3d" | "fallback">("check");
  const [canvasReady, setCanvasReady] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  const captions: Caption[] = [
    {
      a: 0.0, b: 0.185, align: "items-center justify-start",
      node: (
        <div className="max-w-xl px-6 sm:px-10 lg:px-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-forest/25 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-forest backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" /> {site.fullName}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.06] text-forest sm:text-5xl lg:text-[3.8rem]">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
            {site.taglineSub}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/loja?categoria=plantas" className={`${btn} bg-forest text-cream hover:bg-primary`}>
              Ver plantas
            </Link>
            <Link href="/monte-seu-vaso" className={`${btn} border border-forest/30 bg-white/60 text-forest backdrop-blur-sm hover:bg-white`}>
              Monte seu vaso
            </Link>
          </div>
          <p className="mt-10 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-forest/60">
            Role para explorar o jardim
            <ChevronDown className="h-4 w-4 animate-scroll-hint" />
          </p>
        </div>
      ),
    },
    {
      a: 0.25, b: 0.42, align: "items-center justify-end text-right",
      node: (
        <div className="max-w-md px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            Arquitetura em harmonia com o jardim
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
            Vasos, folhagens e canteiros planejados para valorizar cada fachada —
            o mesmo cuidado que levamos para o seu espaço.
          </p>
        </div>
      ),
    },
    {
      a: 0.47, b: 0.66, align: "items-end justify-start pb-24",
      node: (
        <div className="max-w-lg px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            Cada canto, um ecossistema
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Coqueiros", "Palmeiras", "Orquídeas", "Cercas vivas", "Vasos ornamentais", "Caminhos de pedra"].map((c) => (
              <span key={c} className={chip}>{c}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      a: 0.68, b: 0.86, align: "items-center justify-end text-right",
      node: (
        <div className="max-w-sm px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            Detalhes botânicos que encantam
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
            Texturas, cores e espécies escolhidas uma a uma pelos nossos paisagistas.
          </p>
        </div>
      ),
    },
    {
      a: 0.9, b: 1.001, align: "items-end justify-center pb-20 text-center",
      node: (
        <div className="px-6">
          <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
            Leve esse verde para a sua casa
          </h2>
          <a href="#conteudo" className={`${btn} mt-6 inline-flex items-center gap-2 bg-forest text-cream hover:bg-primary`}>
            Explorar a loja <ChevronDown className="h-4 w-4" />
          </a>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 860;
    if (reduced || small || !supportsWebGL()) {
      setMode("fallback");
      return;
    }
    setMode("3d");

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;

        captions.forEach((c, i) => {
          const el = capRefs.current[i];
          if (!el) return;
          const fadeIn = gsap.utils.clamp(0, 1, (p - c.a) / 0.035);
          const fadeOut = 1 - gsap.utils.clamp(0, 1, (p - (c.b - 0.035)) / 0.035);
          const o = Math.min(fadeIn, fadeOut) * (c.a === 0 && p < 0.035 ? 1 : 1);
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 46}px)`;
          el.style.visibility = o <= 0.01 ? "hidden" : "visible";
          el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        });

        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
        if (veilRef.current)
          veilRef.current.style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.94) / 0.06));
      },
    });
    return () => {
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === "fallback") return <StaticHero />;

  return (
    <section ref={sectionRef} className="relative h-[520vh]" aria-label="Apresentação: mansão e jardim Nature Paisagismo">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Poster enquanto o WebGL inicializa */}
        {!canvasReady && (
          <div className="absolute inset-0 z-10 bg-forest">
            <StaticHero loading />
          </div>
        )}

        <Canvas
          shadows
          dpr={[1, 1.8]}
          camera={{ fov: 42, near: 0.5, far: 260, position: [34, 15, 44] }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={() => requestAnimationFrame(() => setCanvasReady(true))}
          className={`transition-opacity duration-1000 ${canvasReady ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        >
          <MansionWorld progress={progress} />
        </Canvas>

        {/* Legibilidade do cabeçalho */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-forest/60 to-transparent" />

        {/* Legendas da narrativa */}
        {captions.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              capRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute inset-0 z-20 flex ${c.align}`}
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
          >
            {c.node}
          </div>
        ))}

        {/* Barra de progresso da cena */}
        <div className="absolute bottom-0 left-0 z-30 h-1 w-full bg-forest/10">
          <div ref={barRef} className="h-full w-0 bg-terracotta transition-[width] duration-150 ease-out" />
        </div>

        {/* Véu de transição para o creme da loja */}
        <div
          ref={veilRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/3 bg-gradient-to-t from-cream to-transparent"
          style={{ opacity: 0 }}
        />
      </div>
    </section>
  );
}
