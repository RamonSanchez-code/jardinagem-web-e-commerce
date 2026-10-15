"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Sparkles, Flower2, Layers,
  Sprout, ClipboardCheck, RotateCw, Crosshair, Download, Shuffle, Droplets, Mountain, Gem,
  Wrench, PartyPopper, Pause, Hand,
} from "lucide-react";
import type { Product, CustomConfig, PotColor, PotSize } from "@/lib/types";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { PotVisual, PotFinish } from "./PotPreview";

const PotPreview = dynamic(() => import("./PotPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="flex items-center gap-2 text-sm text-stonegray">
        <Sparkles className="h-4 w-4 animate-pulse text-terracotta" /> Preparando o estúdio 3D...
      </p>
    </div>
  ),
});

const FLOWER_COLORS = [
  { name: "Rosa", hex: "#e3a7b8" },
  { name: "Branco", hex: "#f2ede3" },
  { name: "Lilás", hex: "#a98fc9" },
  { name: "Amarelo", hex: "#eac45a" },
  { name: "Terracota", hex: "#c97b63" },
];

const KINDS = {
  drenagem: { label: "Drenagem", icon: Droplets, purpose: "Camada no fundo que evita o encharcamento.", badge: "Recomendado" },
  substrato: { label: "Substrato", icon: Mountain, purpose: "Base nutritiva onde as raízes se desenvolvem.", badge: "Essencial" },
  cobertura: { label: "Cobertura decorativa", icon: Gem, purpose: "Acabamento bonito sobre o substrato.", badge: "Opcional" },
  acessorio: { label: "Acessórios", icon: Wrench, purpose: "Complemento para o cuidado diário.", badge: "Opcional" },
} as const;
type Kind = keyof typeof KINDS;
const KIND_ORDER: Kind[] = ["drenagem", "substrato", "cobertura", "acessorio"];

const STYLE_LABEL: Record<string, string> = {
  classico: "Clássico",
  bojo: "Bojudo",
  geometrico: "Geométrico",
  alto: "Alto",
  tigela: "Tigela",
};

const PLANT_FILTERS = [
  { id: "todas", label: "Todas", models: null },
  { id: "folhagens", label: "Folhagens", models: ["folhagem", "palmeira", "pendente"] },
  { id: "suculentas", label: "Suculentas e cactos", models: ["suculenta", "cacto"] },
  { id: "flores", label: "Flores", models: ["orquidea", "flores"] },
] as const;

const STEPS = [
  { n: 1, label: "Vaso", icon: Layers },
  { n: 2, label: "Materiais", icon: ClipboardCheck },
  { n: 3, label: "Planta", icon: Sprout },
  { n: 4, label: "Revisão", icon: Flower2 },
];

function finishOf(p: Product): PotFinish {
  const s = `${p.subcategory} ${p.name}`.toLowerCase();
  if (s.includes("madeira")) return "madeira";
  if (s.includes("plástico")) return "plastico";
  if (s.includes("cimento")) return "cimento";
  if (s.includes("barro")) return "barro";
  if (s.includes("esmaltado") || s.includes("artesanal")) return "esmaltado";
  return "fosco";
}

// Aleatoriedade só em módulo: usada em cliques, nunca durante a renderização
const chance = (p: number) => Math.random() < p;
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const shuffle = <T,>(list: readonly T[]) => [...list].sort(() => Math.random() - 0.5);
const toastId = () => Date.now();

/** Número que “corre” até o novo valor */
function useAnimatedNumber(value: number, duration = 450) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const v = origin + (value - origin) * (1 - Math.pow(1 - p, 3));
      from.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return Math.round(display);
}

export function Customizer({
  pots,
  materials,
  plants,
  initialPotId,
}: {
  pots: Product[];
  materials: Product[];
  plants: Product[];
  initialPotId?: number;
}) {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [pot, setPot] = useState<Product | null>(pots.find((p) => p.id === initialPotId) ?? null);
  const [potColor, setPotColor] = useState<PotColor | null>(pot?.potColors?.[0] ?? null);
  const [potSize, setPotSize] = useState<PotSize | null>(pot?.sizes?.[0] ?? null);
  const [selectedMaterials, setSelectedMaterials] = useState<{ id: number; qty: number }[]>(() => {
    const first = materials.find((m) => m.materialKind === "substrato") ?? materials[0];
    return first ? [{ id: first.id, qty: 1 }] : [];
  });
  const [selectedPlants, setSelectedPlants] = useState<Product[]>([]);
  const [flowerColor, setFlowerColor] = useState(FLOWER_COLORS[0]);
  const [plantFilter, setPlantFilter] = useState<(typeof PLANT_FILTERS)[number]["id"]>("todas");
  const [compositionQty, setCompositionQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Estúdio 3D
  const [layered, setLayered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [celebrate, setCelebrate] = useState(0);
  const [recenter, setRecenter] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const add = useCart((s) => s.add);

  const notify = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: toastId(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  /* ---------------------------------- Derivados -------------------------------- */
  const matProducts = useMemo(
    () =>
      selectedMaterials
        .map((m) => ({ ...m, product: materials.find((x) => x.id === m.id) }))
        .filter((m): m is { id: number; qty: number; product: Product } => !!m.product),
    [selectedMaterials, materials]
  );
  const byKind = (k: Kind) => matProducts.find((m) => (m.product.materialKind ?? "acessorio") === k)?.product ?? null;
  const drain = byKind("drenagem");
  const soil = byKind("substrato");
  const cover = byKind("cobertura");

  const totalCents = useMemo(() => {
    if (!pot) return 0;
    let t = pot.priceCents + (potSize?.deltaCents ?? 0);
    for (const m of matProducts) t += m.product.priceCents * m.qty;
    for (const p of selectedPlants) t += p.priceCents;
    return t;
  }, [pot, potSize, matProducts, selectedPlants]);
  const animatedTotal = useAnimatedNumber(totalCents);

  const hasFloweryPlant = selectedPlants.some((p) => ["orquidea", "flores", "cacto"].includes(p.plantModel ?? ""));

  const visual: PotVisual = {
    style: pot?.potStyle ?? (pot ? "classico" : null),
    color: potColor?.hex ?? "#b8754f",
    finish: pot ? finishOf(pot) : "fosco",
    sizeScale: potSize?.id === "p" ? 0.85 : potSize?.id === "g" ? 1.18 : 1,
    drainage: drain?.name ?? null,
    soil: soil?.name ?? null,
    cover: cover ? { name: cover.name, kind: /pinus|casca/i.test(cover.name) ? "casca" : "pedrisco" } : null,
    plants: selectedPlants.map((p) => ({
      id: p.id,
      name: p.name,
      model: p.plantModel ?? "folhagem",
      flowerColor: flowerColor.hex,
    })),
  };

  const reviewRows = useMemo(() => {
    const rows: { label: string; detail?: string; cents: number }[] = [];
    if (pot)
      rows.push({
        label: `Vaso ${pot.name}`,
        detail: [potColor?.name, potSize?.label].filter(Boolean).join(" · "),
        cents: pot.priceCents + (potSize?.deltaCents ?? 0),
      });
    for (const m of matProducts)
      rows.push({ label: m.product.name, detail: m.qty > 1 ? `${m.qty} unidades` : undefined, cents: m.product.priceCents * m.qty });
    for (const p of selectedPlants)
      rows.push({
        label: p.name,
        detail: hasFloweryPlant && ["orquidea", "flores", "cacto"].includes(p.plantModel ?? "") ? `Flores ${flowerColor.name.toLowerCase()}` : undefined,
        cents: p.priceCents,
      });
    return rows;
  }, [pot, potColor, potSize, matProducts, selectedPlants, hasFloweryPlant, flowerColor]);

  const summaryLines = reviewRows.map((r) => (r.detail ? `${r.label} — ${r.detail}` : r.label));

  const config: CustomConfig | null = pot
    ? {
        potId: pot.id,
        potName: pot.name,
        potStyle: pot.potStyle ?? undefined,
        potColor: potColor?.name,
        potColorHex: potColor?.hex,
        sizeId: potSize?.id,
        sizeLabel: potSize?.label,
        materials: matProducts.map((m) => ({ id: m.id, name: m.product.name, qty: m.qty })),
        plants: selectedPlants.map((p) => ({ id: p.id, name: p.name, model: p.plantModel ?? undefined })),
        flowerColor: hasFloweryPlant ? flowerColor.name : undefined,
      }
    : null;

  const layers = [
    { key: "vaso", label: "Vaso", icon: Layers, done: !!pot, step: 1 },
    { key: "drenagem", label: "Drenagem", icon: Droplets, done: !!drain, step: 2 },
    { key: "substrato", label: "Substrato", icon: Mountain, done: !!soil, step: 2 },
    { key: "cobertura", label: "Cobertura", icon: Gem, done: !!cover, step: 2 },
    { key: "planta", label: "Planta", icon: Sprout, done: selectedPlants.length > 0, step: 3 },
  ];
  const progress = layers.filter((l) => l.done).length / layers.length;

  const canNext = step === 1 ? !!pot : step === 3 ? selectedPlants.length > 0 : true;
  const nextHint = step === 1 && !pot ? "Escolha um vaso para continuar" : step === 3 && !selectedPlants.length ? "Escolha ao menos uma planta" : null;

  /* ---------------------------------- Ações ------------------------------------ */
  const goTo = (n: number) => {
    if (n < 1 || n > 4) return;
    if (n > maxStep && !(n === step + 1 && canNext)) return;
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    setLayered(n === 2);
    if (n === 4) setCelebrate((c) => c + 1);
  };

  const selectPot = (p: Product) => {
    setPot(p);
    setPotColor(p.potColors?.[0] ?? null);
    setPotSize(p.sizes?.[1] ?? p.sizes?.[0] ?? null);
    notify(`${p.name} no pódio`);
  };

  const toggleMaterial = (m: Product) => {
    const exists = selectedMaterials.some((x) => x.id === m.id);
    const kind = m.materialKind ?? "acessorio";
    setSelectedMaterials((cur) =>
      exists
        ? cur.filter((x) => x.id !== m.id)
        : [...cur.filter((x) => (materials.find((p) => p.id === x.id)?.materialKind ?? "acessorio") !== kind), { id: m.id, qty: 1 }]
    );
    notify(exists ? `${m.name} removido` : `${m.name} adicionado`);
  };

  const setMaterialQty = (id: number, delta: number) =>
    setSelectedMaterials((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.min(3, Math.max(1, x.qty + delta)) } : x)));

  const togglePlant = (p: Product) => {
    const exists = selectedPlants.some((x) => x.id === p.id);
    setSelectedPlants((cur) => {
      if (exists) return cur.filter((x) => x.id !== p.id);
      if (cur.length >= 2) return [cur[1], p];
      return [...cur, p];
    });
    if (exists) notify(`${p.name} removida`);
    else {
      notify(`${p.name} plantada!`);
      setCelebrate((c) => c + 1);
    }
  };

  const surprise = () => {
    const p = pick(pots);
    const plantsPool = shuffle(plants);
    const mats: { id: number; qty: number }[] = [];
    for (const k of ["drenagem", "substrato", "cobertura"] as Kind[]) {
      const opts = materials.filter((m) => (m.materialKind ?? "acessorio") === k);
      if (opts.length && (k !== "cobertura" || chance(0.65))) mats.push({ id: pick(opts).id, qty: 1 });
    }
    setPot(p);
    setPotColor(p.potColors?.length ? pick(p.potColors) : null);
    setPotSize(p.sizes?.length ? pick(p.sizes) : null);
    setSelectedMaterials(mats);
    setSelectedPlants(plantsPool.slice(0, chance(0.4) ? 2 : 1));
    setFlowerColor(pick(FLOWER_COLORS));
    setStep(4);
    setMaxStep(4);
    setLayered(false);
    setCelebrate((c) => c + 1);
    notify("Composição surpresa criada!");
  };

  const onAddToCart = () => {
    if (!config || !pot) return;
    add({
      kind: "personalizado",
      name: `Vaso personalizado — ${pot.name}`,
      image: pot.image,
      unitPriceCents: totalCents,
      qty: compositionQty,
      custom: config,
      lines: summaryLines,
    });
    setAdded(true);
    setCelebrate((c) => c + 1);
    setTimeout(() => setAdded(false), 2200);
  };

  /** Salva a vista atual do 3D como imagem, sobre o fundo creme da loja */
  const downloadImage = () => {
    const src = canvasRef.current;
    if (!src) return;
    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    const g = ctx.createRadialGradient(out.width / 2, 0, 0, out.width / 2, 0, out.height * 1.2);
    g.addColorStop(0, "#fffdf8");
    g.addColorStop(1, "#ece2d1");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, 0, 0);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = "meu-vaso-nature.png";
    a.click();
    notify("Imagem salva!");
  };

  const filteredPlants = useMemo(() => {
    const f = PLANT_FILTERS.find((x) => x.id === plantFilter);
    return f?.models ? plants.filter((p) => (f.models as readonly string[]).includes(p.plantModel ?? "folhagem")) : plants;
  }, [plants, plantFilter]);

  const toolBtn = (active: boolean) =>
    `flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 backdrop-blur-md transition ${
      active ? "bg-forest text-cream ring-forest" : "bg-white/85 text-forest ring-black/5 hover:bg-white"
    }`;

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_26rem] lg:gap-10 lg:pb-0">
      {/* ------------------------------ Estúdio 3D ------------------------------ */}
      <div className="order-first lg:order-none">
        <div className="lg:sticky lg:top-28">
          <div className="relative h-[22rem] overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_0%,#fffdf8_0%,#f4ede1_55%,#e7dcc8_100%)] ring-1 ring-sand sm:h-[28rem] lg:h-[34rem]">
            <PotPreview
              visual={visual}
              step={step}
              layered={layered}
              autoRotate={autoRotate}
              celebrate={celebrate}
              recenter={recenter}
              canvasRef={canvasRef}
            />

            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-forest/90 px-4 py-1.5 text-xs font-semibold text-cream shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
              </span>
              Etapa {step} de 4 · {STEPS[step - 1].label}
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button onClick={() => setAutoRotate((v) => !v)} className={toolBtn(autoRotate)} title={autoRotate ? "Pausar rotação" : "Girar automaticamente"} aria-label={autoRotate ? "Pausar rotação" : "Girar automaticamente"} aria-pressed={autoRotate}>
                {autoRotate ? <Pause className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
              </button>
              <button onClick={() => { setLayered((v) => !v); notify(layered ? "Vista normal" : "Vista em camadas"); }} disabled={!pot} className={`${toolBtn(layered)} disabled:opacity-40`} title="Ver camadas da montagem" aria-label="Ver camadas da montagem" aria-pressed={layered}>
                <Layers className="h-4 w-4" />
              </button>
              <button onClick={() => setRecenter((n) => n + 1)} className={toolBtn(false)} title="Recentralizar" aria-label="Recentralizar visualização">
                <Crosshair className="h-4 w-4" />
              </button>
              <button onClick={downloadImage} disabled={!pot} className={`${toolBtn(false)} disabled:opacity-40`} title="Baixar imagem" aria-label="Baixar imagem da composição">
                <Download className="h-4 w-4" />
              </button>
            </div>

            <p className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-1.5 text-[0.7rem] font-medium text-stonegray sm:flex">
              <Hand className="h-3.5 w-3.5" /> Arraste para girar · role para aproximar
            </p>

            {toast && (
              <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
                <p key={toast.id} className="animate-toast-in flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-forest shadow-lg ring-1 ring-black/5">
                  <Sparkles className="h-3.5 w-3.5 text-terracotta" /> {toast.text}
                </p>
              </div>
            )}
          </div>

          {/* Sua montagem */}
          <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-sand">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-sand)" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-leaf)" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={`${progress * 97.4} 97.4`}
                    className="transition-[stroke-dasharray] duration-700 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-forest">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-stonegray">Sua montagem</p>
                <p className="truncate text-sm font-semibold text-ink">
                  {pot ? pot.name : "Comece escolhendo um vaso"}
                  {selectedPlants.length > 0 && <span className="font-normal text-stonegray"> + {selectedPlants.map((p) => p.name).join(" + ")}</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-stonegray">Total</p>
                <p className="text-2xl font-bold tabular-nums text-forest">
                  <span key={totalCents} className="animate-bump">{brl(animatedTotal)}</span>
                </p>
              </div>
            </div>
            <ol className="mt-4 grid grid-cols-5 gap-2" aria-label="Camadas da composição">
              {layers.map((l) => (
                <li key={l.key}>
                  <button
                    onClick={() => goTo(l.step)}
                    className={`flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-center transition ${l.done ? "bg-leaf/10 text-forest" : "bg-sand/40 text-stonegray hover:bg-sand/70"}`}
                  >
                    <span key={String(l.done)} className={`flex h-8 w-8 items-center justify-center rounded-full ${l.done ? "animate-pop-in bg-leaf text-white" : "bg-white text-stonegray ring-1 ring-sand-dark"}`}>
                      {l.done ? <Check className="h-4 w-4" /> : <l.icon className="h-4 w-4" />}
                    </span>
                    <span className="text-[0.62rem] font-semibold leading-tight">{l.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ------------------------------- Assistente ------------------------------ */}
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stonegray">Monte em 4 passos</p>
          <button
            onClick={surprise}
            className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-4 py-2 text-xs font-semibold text-terracotta-dark ring-1 ring-terracotta/25 transition hover:bg-terracotta hover:text-white"
          >
            <Shuffle className="h-3.5 w-3.5" /> Surpreenda-me
          </button>
        </div>

        {/* Etapas */}
        <div className="relative mb-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-[1.1rem] h-1 rounded-full bg-sand">
            <div className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-out" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
          <ol className="relative grid grid-cols-4" aria-label="Etapas da montagem">
            {STEPS.map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              const reachable = s.n <= maxStep || (s.n === step + 1 && canNext);
              return (
                <li key={s.n} className="flex justify-center">
                  <button
                    onClick={() => goTo(s.n)}
                    disabled={!reachable}
                    className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                    aria-current={active ? "step" : undefined}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition duration-300 ${
                        done ? "bg-leaf text-white" : active ? "scale-110 bg-forest text-cream ring-4 ring-forest/15" : "bg-white text-stonegray ring-1 ring-sand-dark group-enabled:group-hover:ring-leaf"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </span>
                    <span className={`text-[0.62rem] font-semibold uppercase tracking-wide ${active ? "text-forest" : "text-stonegray"}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div key={step} className="animate-step-in">
          {/* ------------------------------- Etapa 1 -------------------------------- */}
          {step === 1 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-forest">Escolha o vaso</h2>
              <p className="mt-1 text-sm text-stonegray">Toque em um modelo e veja-o surgir no pódio. Cada um tem cores e tamanhos próprios.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {pots.map((p) => {
                  const selected = pot?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => selectPot(p)}
                      className={`group relative overflow-hidden rounded-2xl bg-white text-left transition duration-300 ${
                        selected ? "-translate-y-0.5 shadow-lg shadow-forest/10 ring-2 ring-forest" : "ring-1 ring-sand hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={p.image} alt={p.name} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-105" />
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-forest">
                          {STYLE_LABEL[p.potStyle ?? "classico"]}
                        </span>
                        {selected && (
                          <span className="animate-pop-in absolute right-2 top-2 rounded-full bg-forest p-1.5 text-cream">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold leading-tight text-ink">{p.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex -space-x-1">
                            {(p.potColors ?? []).slice(0, 4).map((c) => (
                              <span key={c.name} className="h-4 w-4 rounded-full ring-2 ring-white" style={{ backgroundColor: c.hex }} />
                            ))}
                          </span>
                          <span className="text-sm font-bold text-forest">{brl(p.priceCents)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {pot && (
                <div key={pot.id} className="animate-step-in mt-5 space-y-5 rounded-3xl bg-white p-5 ring-1 ring-sand">
                  {pot.potColors && pot.potColors.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stonegray">
                        Cor <span className="ml-1 normal-case tracking-normal text-ink">{potColor?.name}</span>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {pot.potColors.map((c) => {
                          const sel = potColor?.name === c.name;
                          return (
                            <button
                              key={c.name}
                              onClick={() => setPotColor(c)}
                              aria-label={`Cor ${c.name}`}
                              title={c.name}
                              className={`flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-white transition hover:scale-110 ${sel ? "scale-110 ring-forest" : "ring-sand-dark"}`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {sel && <Check className="h-4 w-4 text-white drop-shadow" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {pot.sizes && pot.sizes.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stonegray">Tamanho</p>
                      <div className="grid grid-cols-3 gap-2">
                        {pot.sizes.map((s, i) => {
                          const sel = potSize?.id === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setPotSize(s)}
                              className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition ${sel ? "bg-forest text-cream" : "bg-sand/40 text-ink hover:bg-sand"}`}
                            >
                              <span className={`w-5 rounded-t-md rounded-b-sm ${sel ? "bg-cream/80" : "bg-terracotta/60"}`} style={{ height: 10 + i * 7 }} />
                              <span className="text-xs font-bold">{s.label.split(" — ")[0]}</span>
                              <span className={`text-[0.65rem] ${sel ? "text-cream/75" : "text-stonegray"}`}>
                                {s.label.split(" — ")[1]}{s.deltaCents > 0 ? ` · +${brl(s.deltaCents)}` : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ------------------------------- Etapa 2 -------------------------------- */}
          {step === 2 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-forest">Monte as camadas</h2>
              <p className="mt-1 text-sm text-stonegray">
                Veja cada camada entrar no vaso. Use o botão <Layers className="inline h-3.5 w-3.5" /> para alternar a vista em camadas.
              </p>
              <div className="mt-5 space-y-6">
                {KIND_ORDER.map((k) => {
                  const items = materials.filter((m) => (m.materialKind ?? "acessorio") === k);
                  if (!items.length) return null;
                  const meta = KINDS[k];
                  return (
                    <div key={k}>
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                          <meta.icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <p className="flex items-center gap-2 text-sm font-bold text-ink">
                            {meta.label}
                            <span className="rounded-full bg-sand/70 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-stonegray">{meta.badge}</span>
                          </p>
                          <p className="text-[0.72rem] text-stonegray">{meta.purpose}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {items.map((m) => {
                          const sel = selectedMaterials.find((x) => x.id === m.id);
                          return (
                            <div
                              key={m.id}
                              className={`flex items-center gap-3 rounded-2xl bg-white p-2.5 transition duration-300 ${sel ? "shadow-md shadow-forest/5 ring-2 ring-forest" : "ring-1 ring-sand hover:ring-sand-dark"}`}
                            >
                              <button onClick={() => toggleMaterial(m)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-pressed={!!sel}>
                                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/60">
                                  <Image src={m.image} alt="" fill sizes="56px" className="object-cover" />
                                  {sel && (
                                    <span className="animate-pop-in absolute inset-0 flex items-center justify-center bg-forest/55 text-white">
                                      <Check className="h-5 w-5" />
                                    </span>
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-ink">{m.name}</span>
                                  <span className="line-clamp-1 text-[0.7rem] text-stonegray">{m.shortDesc}</span>
                                  <span className="mt-0.5 block text-xs font-bold text-forest">{brl(m.priceCents * (sel?.qty ?? 1))}</span>
                                </span>
                              </button>
                              {sel ? (
                                <div className="flex items-center rounded-full bg-sand/50">
                                  <button onClick={() => setMaterialQty(m.id, -1)} className="p-2 text-ink/60 hover:text-forest" aria-label="Diminuir">
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-4 text-center text-xs font-bold">{sel.qty}</span>
                                  <button onClick={() => setMaterialQty(m.id, 1)} className="p-2 text-ink/60 hover:text-forest" aria-label="Aumentar">
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => toggleMaterial(m)} className="rounded-full bg-sand/50 px-3 py-1.5 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream">
                                  Adicionar
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ------------------------------- Etapa 3 -------------------------------- */}
          {step === 3 && (
            <section>
              <h2 className="font-display text-2xl font-semibold text-forest">Escolha a planta ou as flores</h2>
              <p className="mt-1 text-sm text-stonegray">Veja-a brotar no vaso. Combine até 2 espécies.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PLANT_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPlantFilter(f.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${plantFilter === f.id ? "bg-forest text-cream" : "bg-white text-ink ring-1 ring-sand hover:ring-leaf"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {filteredPlants.map((p) => {
                  const idx = selectedPlants.findIndex((x) => x.id === p.id);
                  const selected = idx >= 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlant(p)}
                      className={`group overflow-hidden rounded-2xl bg-white text-left transition duration-300 ${
                        selected ? "-translate-y-0.5 shadow-lg shadow-forest/10 ring-2 ring-forest" : "ring-1 ring-sand hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={p.image} alt={p.name} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-105" />
                        {p.careLevel && (
                          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-forest">
                            Cuidado {p.careLevel}
                          </span>
                        )}
                        {selected && (
                          <span className="animate-pop-in absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-cream">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold leading-tight text-ink">{p.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-stonegray">{[p.light && `Luz ${p.light}`, p.water].filter(Boolean).join(" · ")}</p>
                        <p className="mt-1.5 text-sm font-bold text-forest">{brl(p.priceCents)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasFloweryPlant && (
                <div className="animate-step-in mt-5 rounded-3xl bg-white p-5 ring-1 ring-sand">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stonegray">
                    <Flower2 className="h-4 w-4 text-terracotta" /> Cor das flores
                    <span className="normal-case tracking-normal text-ink">{flowerColor.name}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {FLOWER_COLORS.map((c) => {
                      const sel = flowerColor.name === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setFlowerColor(c)}
                          aria-label={`Flores ${c.name}`}
                          title={c.name}
                          className={`flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-white transition hover:scale-110 ${sel ? "scale-110 ring-forest" : "ring-sand-dark"}`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {sel && <Check className="h-4 w-4 text-forest" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ------------------------------- Etapa 4 -------------------------------- */}
          {step === 4 && (
            <section>
              <div className="flex items-center gap-3">
                <span className="animate-pop-in flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/15 text-terracotta-dark">
                  <PartyPopper className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-forest">Sua composição está pronta!</h2>
                  <p className="text-sm text-stonegray">Confira os itens. Você pode voltar e ajustar quando quiser.</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-sand">
                <ul className="divide-y divide-sand">
                  {reviewRows.map((r, i) => (
                    <li key={i} className="animate-step-in flex items-start justify-between gap-3 py-3 first:pt-0" style={{ animationDelay: `${i * 60}ms` }}>
                      <span className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>
                          <span className="block text-sm font-medium text-ink">{r.label}</span>
                          {r.detail && <span className="block text-[0.7rem] text-stonegray">{r.detail}</span>}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-ink/80">{brl(r.cents)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-sand pt-4">
                  <p className="text-sm font-semibold text-ink">Total da composição</p>
                  <p className="text-xl font-bold tabular-nums text-forest">{brl(totalCents)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-stonegray">Quantidade</p>
                  <div className="flex items-center rounded-full bg-sand/50">
                    <button onClick={() => setCompositionQty((q) => Math.max(1, q - 1))} className="p-2.5 text-ink/60 hover:text-forest" aria-label="Diminuir">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{compositionQty}</span>
                    <button onClick={() => setCompositionQty((q) => Math.min(10, q + 1))} className="p-2.5 text-ink/60 hover:text-forest" aria-label="Aumentar">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={onAddToCart}
                  className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition ${added ? "bg-leaf" : "bg-primary hover:bg-forest"}`}
                >
                  {added ? <><Check className="h-4 w-4" /> Adicionado ao carrinho!</> : <><ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho — {brl(totalCents * compositionQty)}</>}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadImage}
                    className="flex items-center justify-center gap-2 rounded-full border border-forest/25 bg-white py-3 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream"
                  >
                    <Download className="h-4 w-4" /> Salvar imagem
                  </button>
                  <Link
                    href="/loja"
                    className="flex items-center justify-center gap-2 rounded-full border border-forest/25 bg-white py-3 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream"
                  >
                    Continuar comprando
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Navegação do assistente */}
        <div className="mt-8 hidden items-center justify-between border-t border-sand pt-5 lg:flex">
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-sand/60 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          {step < 4 ? (
            <div className="flex items-center gap-3">
              {nextHint && <span className="text-xs text-stonegray">{nextHint}</span>}
              <button
                onClick={() => goTo(step + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-sand disabled:text-stonegray"
              >
                Avançar <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => goTo(1)}
              className="text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
            >
              Recomeçar montagem
            </button>
          )}
        </div>
      </div>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            onClick={() => goTo(step - 1)}
            disabled={step === 1}
            className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-sand-dark disabled:opacity-40"
            aria-label="Etapa anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-stonegray">Etapa {step} de 4</p>
            <p className="text-lg font-bold tabular-nums text-forest">{brl(animatedTotal)}</p>
          </div>
          {step < 4 ? (
            <button
              onClick={() => goTo(step + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream disabled:bg-sand disabled:text-stonegray"
            >
              Avançar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onAddToCart}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold text-white ${added ? "bg-leaf" : "bg-primary"}`}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />} {added ? "Adicionado" : "Comprar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
