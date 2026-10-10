"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, Leaf } from "lucide-react";
import { StaticHero } from "./StaticHero";
import { site } from "@/lib/site";

/**
 * Sequência de imagens extraída do GIF enviado pelo cliente (varanda florida
 * que se abre para o interior do apartamento e, ao final, para o jardim).
 * 96 quadros em /public/img/balcony, nomeados frame-000.webp .. frame-095.webp.
 */
const FRAME_COUNT = 96;
const frameUrl = (i: number) => `/img/balcony/frame-${String(i).padStart(3, "0")}.webp`;

type Caption = { a: number; b: number; align: string; node: React.ReactNode };

const btn =
  "rounded-full px-7 py-3.5 text-sm font-semibold transition pointer-events-auto";
const chip =
  "rounded-full border border-forest/20 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-forest backdrop-blur-sm";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function BalconyExperience() {
  // Calculado de forma preguiçosa (sem setState em efeito): este componente só
  // é renderizado no cliente via dynamic(..., { ssr: false }), então window já existe.
  const [mode] = useState<"active" | "fallback">(() => (prefersReducedMotion() ? "fallback" : "active"));
  const [ready, setReady] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);
  const currentFrameRef = useRef(0);

  const captions: Caption[] = [
    {
      a: 0.0, b: 0.17, align: "items-center justify-start",
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
            Role para explorar o verde
            <ChevronDown className="h-4 w-4 animate-scroll-hint" />
          </p>
        </div>
      ),
    },
    {
      a: 0.2, b: 0.37, align: "items-start justify-end pt-28 text-right",
      node: (
        <div className="max-w-md px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            Cada vaso, uma composição pensada
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
            Espécies selecionadas criam camadas de verde na varanda, com
            texturas e alturas que conversam entre si.
          </p>
        </div>
      ),
    },
    {
      a: 0.4, b: 0.58, align: "items-start justify-start pt-28",
      node: (
        <div className="max-w-lg px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            O verde atravessa a porta da sala
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Costela-de-adão", "Jiboia", "Zamioculca", "Samambaia", "Palmeira-ráfia"].map((c) => (
              <span key={c} className={chip}>{c}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      a: 0.62, b: 0.82, align: "items-end justify-start pb-24",
      node: (
        <div className="max-w-sm px-6 sm:px-10 lg:px-20">
          <h2 className="font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
            Ambientes internos tão vivos quanto o jardim
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70 sm:text-base">
            Da sala ao corredor, cada cômodo ganha uma camada de natureza,
            luz e cor.
          </p>
        </div>
      ),
    },
    {
      a: 0.88, b: 1.001, align: "items-end justify-center pb-20 text-center",
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

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0 || canvas.height === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    // "object-fit: cover" manual, para preencher a área sem distorcer a proporção original do GIF
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(parent.clientWidth * dpr);
    const h = Math.round(parent.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    if (mode !== "active") return;

    let cancelled = false;
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        loadedCountRef.current += 1;
        if (i === 0) {
          resizeCanvas();
          setReady(true);
        }
        // Redesenha se o quadro recém-carregado é o que deveria estar visível agora
        if (i === currentFrameRef.current) drawFrame(i);
      };
      img.src = frameUrl(i);
      imgs.push(img);
    }
    imagesRef.current = imgs;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;

        const maxLoadedIndex = Math.max(0, loadedCountRef.current - 1);
        const targetIndex = Math.round(p * (FRAME_COUNT - 1));
        const frameIndex = Math.min(targetIndex, maxLoadedIndex);
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }

        captions.forEach((c, i) => {
          const el = capRefs.current[i];
          if (!el) return;
          const fadeIn = gsap.utils.clamp(0, 1, (p - c.a) / 0.035);
          const fadeOut = 1 - gsap.utils.clamp(0, 1, (p - (c.b - 0.035)) / 0.035);
          const o = Math.min(fadeIn, fadeOut);
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 46}px)`;
          el.style.visibility = o <= 0.01 ? "hidden" : "visible";
          el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        });

        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
        if (veilRef.current)
          veilRef.current.style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.94) / 0.06));
        // Zoom sutil acompanhando o scroll, reforçando a sensação de avançar pelo ambiente
        if (zoomRef.current)
          zoomRef.current.style.transform = `scale(${1 + p * 0.14})`;
      },
    });

    return () => {
      cancelled = true;
      st.kill();
      window.removeEventListener("resize", resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === "fallback") return <StaticHero />;

  return (
    <section
      ref={sectionRef}
      className="relative h-[520vh]"
      aria-label="Apresentação: passeio pela varanda florida e pelo interior verde da Nature Paisagismo"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-forest">
        {/* Poster enquanto os quadros carregam */}
        {!ready && (
          <div className="absolute inset-0 z-10 bg-forest">
            <StaticHero loading />
          </div>
        )}

        <div ref={zoomRef} className="absolute inset-0 origin-center will-change-transform">
          <canvas
            ref={canvasRef}
            className={`h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
            aria-hidden
          />
        </div>

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
