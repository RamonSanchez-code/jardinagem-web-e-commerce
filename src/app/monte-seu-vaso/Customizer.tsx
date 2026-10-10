"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Check, ChevronLeft, ChevronRight, Minus, Plus, Save, ShoppingBag,
  Sparkles, Flower2, Layers, Sprout, ClipboardCheck,
} from "lucide-react";
import type { Product, CustomConfig, PotColor, PotSize } from "@/db/schema";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { saveCompositionAction } from "@/lib/actions";
import type { PotVisual } from "./PotPreview";

const PotPreview = dynamic(() => import("./PotPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-72 items-center justify-center bg-[#f3ede1]">
      <p className="flex items-center gap-2 text-sm text-stonegray">
        <Sparkles className="h-4 w-4 animate-pulse text-terracotta" /> Carregando visualização 3D...
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

const KIND_PURPOSE: Record<string, string> = {
  substrato: "Base nutritiva onde as raízes se desenvolvem.",
  drenagem: "Camada no fundo que evita o encharcamento.",
  cobertura: "Acabamento decorativo sobre o substrato.",
  acessorio: "Complemento para o cuidado diário.",
};

const STEPS = [
  { n: 1, label: "Escolha o vaso", icon: Layers },
  { n: 2, label: "Materiais", icon: ClipboardCheck },
  { n: 3, label: "Planta ou flores", icon: Sprout },
  { n: 4, label: "Revisão", icon: Flower2 },
];

export function Customizer({
  pots,
  materials,
  plants,
  initialPotId,
  loggedIn,
}: {
  pots: Product[];
  materials: Product[];
  plants: Product[];
  initialPotId?: number;
  loggedIn: boolean;
}) {
  const [step, setStep] = useState(1);
  const [pot, setPot] = useState<Product | null>(
    pots.find((p) => p.id === initialPotId) ?? null
  );
  const [potColor, setPotColor] = useState<PotColor | null>(
    pot?.potColors?.[0] ?? null
  );
  const [potSize, setPotSize] = useState<PotSize | null>(pot?.sizes?.[0] ?? null);
  const [selectedMaterials, setSelectedMaterials] = useState<{ id: number; qty: number }[]>(() => {
    const first = materials.find((m) => m.materialKind === "substrato") ?? materials[0];
    return first ? [{ id: first.id, qty: 1 }] : [];
  });
  const [selectedPlants, setSelectedPlants] = useState<Product[]>([]);
  const [flowerColor, setFlowerColor] = useState(FLOWER_COLORS[0]);
  const [compositionQty, setCompositionQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const add = useCart((s) => s.add);

  /* ---------------------------------- Preço ----------------------------------- */
  const totalCents = useMemo(() => {
    if (!pot) return 0;
    let t = pot.priceCents + (potSize?.deltaCents ?? 0);
    for (const m of selectedMaterials) {
      const mp = materials.find((x) => x.id === m.id);
      if (mp) t += mp.priceCents * m.qty;
    }
    for (const p of selectedPlants) t += p.priceCents;
    return t;
  }, [pot, potSize, selectedMaterials, selectedPlants, materials]);

  const hasFloweryPlant = selectedPlants.some(
    (p) => p.plantModel === "orquidea" || p.plantModel === "flores"
  );

  const visual: PotVisual = useMemo(() => {
    const sizeScale =
      potSize?.id === "p" ? 0.82 : potSize?.id === "g" ? 1.22 : 1;
    const first = selectedPlants[0];
    return {
      style: pot?.potStyle ?? "classico",
      color: potColor?.hex ?? "#b8754f",
      sizeScale,
      materials: selectedMaterials
        .map((m) => materials.find((x) => x.id === m.id)?.materialKind ?? "")
        .filter(Boolean) as string[],
      plant: first
        ? { model: first.plantModel ?? "folhagem", flowerColor: flowerColor.hex }
        : null,
    };
  }, [pot, potColor, potSize, selectedMaterials, selectedPlants, materials, flowerColor]);

  const summaryLines = useMemo(() => {
    const lines: string[] = [];
    if (pot)
      lines.push(`Vaso ${pot.name}${potColor ? ` — ${potColor.name}` : ""}${potSize ? ` (${potSize.label})` : ""}`);
    for (const m of selectedMaterials) {
      const mp = materials.find((x) => x.id === m.id);
      if (mp) lines.push(`${mp.name} × ${m.qty}`);
    }
    for (const p of selectedPlants)
      lines.push(hasFloweryPlant ? `${p.name} (${flowerColor.name})` : p.name);
    return lines;
  }, [pot, potColor, potSize, selectedMaterials, selectedPlants, materials, hasFloweryPlant, flowerColor]);

  const config: CustomConfig | null = pot
    ? {
        potId: pot.id,
        potName: pot.name,
        potStyle: pot.potStyle ?? undefined,
        potColor: potColor?.name,
        potColorHex: potColor?.hex,
        sizeId: potSize?.id,
        sizeLabel: potSize?.label,
        materials: selectedMaterials.map((m) => ({
          id: m.id,
          name: materials.find((x) => x.id === m.id)?.name ?? "",
          qty: m.qty,
        })),
        plants: selectedPlants.map((p) => ({
          id: p.id,
          name: p.name,
          model: p.plantModel ?? undefined,
        })),
        flowerColor: hasFloweryPlant ? flowerColor.name : undefined,
      }
    : null;

  const canNext = step === 1 ? !!pot : step === 3 ? selectedPlants.length > 0 : true;

  const selectPot = (p: Product) => {
    setPot(p);
    setPotColor(p.potColors?.[0] ?? null);
    setPotSize(p.sizes?.[0] ?? null);
  };

  const toggleMaterial = (m: Product) => {
    setSelectedMaterials((cur) => {
      const exists = cur.find((x) => x.id === m.id);
      if (exists) return cur.filter((x) => x.id !== m.id);
      // um item por tipo de material (substrato, drenagem, cobertura)
      const kind = m.materialKind ?? "acessorio";
      return [...cur.filter((x) => (materials.find((p) => p.id === x.id)?.materialKind ?? "acessorio") !== kind), { id: m.id, qty: 1 }];
    });
  };

  const togglePlant = (p: Product) => {
    setSelectedPlants((cur) => {
      if (cur.find((x) => x.id === p.id)) return cur.filter((x) => x.id !== p.id);
      if (cur.length >= 2) return [cur[1], p];
      return [...cur, p];
    });
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
    setTimeout(() => setAdded(false), 2200);
  };

  const onSave = () => {
    if (!config) return;
    setSaveMsg(null);
    startTransition(async () => {
      const res = await saveCompositionAction(config, totalCents, `Composição ${pot?.name ?? ""}`);
      setSaveMsg(res.ok ? "Composição salva na sua conta!" : res.error ?? "Não foi possível salvar.");
    });
  };

  const grouped = useMemo(() => {
    const kinds = ["substrato", "drenagem", "cobertura", "acessorio"];
    const labels: Record<string, string> = {
      substrato: "Substrato",
      drenagem: "Drenagem",
      cobertura: "Cobertura decorativa",
      acessorio: "Acessórios",
    };
    return kinds
      .map((k) => ({ kind: k, label: labels[k], items: materials.filter((m) => (m.materialKind ?? "acessorio") === k) }))
      .filter((g) => g.items.length > 0);
  }, [materials]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_25rem]">
      {/* ------------------------------ Preview 3D ------------------------------ */}
      <div className="order-first lg:order-none">
        <div className="lg:sticky lg:top-28">
          <div className="relative h-80 overflow-hidden rounded-3xl ring-1 ring-sand sm:h-[26rem] lg:h-[32rem]">
            <PotPreview visual={visual} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-forest/85 px-4 py-1.5 text-xs font-semibold text-cream backdrop-blur-sm">
              Visualização 3D — gire e aproxime
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-5 py-4 ring-1 ring-sand">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-stonegray">Total da composição</p>
              <p className="text-2xl font-bold text-forest">{brl(totalCents)}</p>
            </div>
            <p className="max-w-[55%] text-right text-[0.7rem] leading-snug text-stonegray">
              {pot ? pot.name : "Escolha um vaso"}{selectedPlants.length > 0 && ` + ${selectedPlants.map((p) => p.name).join(" + ")}`}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------- Assistente ------------------------------ */}
      <div>
        {/* Barra de progresso */}
        <ol className="mb-8 flex items-center" aria-label="Etapas da montagem">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n} className="flex flex-1 items-center last:flex-none">
                <button
                  onClick={() => (done || active) && setStep(s.n)}
                  className="flex flex-col items-center gap-1.5"
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                      done ? "bg-leaf text-white" : active ? "bg-forest text-cream ring-4 ring-forest/15" : "bg-sand text-stonegray"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span className={`hidden text-[0.6rem] font-semibold uppercase tracking-wide sm:block ${active ? "text-forest" : "text-stonegray"}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className={`mx-1 h-0.5 flex-1 rounded sm:mx-2 ${step > s.n ? "bg-leaf" : "bg-sand"}`} />
                )}
              </li>
            );
          })}
        </ol>

        {/* ------------------------------- Etapa 1 -------------------------------- */}
        {step === 1 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-forest">Escolha o vaso</h2>
            <p className="mt-1 text-sm text-stonegray">Cerâmica, barro, cimento ou plástico — cada modelo com cores e tamanhos próprios.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {pots.map((p) => {
                const selected = pot?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPot(p)}
                    className={`group overflow-hidden rounded-2xl bg-white text-left ring-2 transition ${
                      selected ? "ring-forest" : "ring-sand hover:ring-sand-dark"
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="relative aspect-square">
                      <Image src={p.image} alt={p.name} fill sizes="200px" className="object-cover transition duration-500 group-hover:scale-105" />
                      {selected && (
                        <span className="absolute right-2 top-2 rounded-full bg-forest p-1.5 text-cream">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold leading-tight text-ink">{p.name}</p>
                      <p className="mt-0.5 text-[0.7rem] text-stonegray">{p.subcategory || p.height}</p>
                      <p className="mt-1.5 text-sm font-bold text-forest">{brl(p.priceCents)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {pot?.potColors && pot.potColors.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stonegray">Cor — {potColor?.name}</p>
                <div className="flex flex-wrap gap-2.5">
                  {pot.potColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setPotColor(c)}
                      aria-label={`Cor ${c.name}`}
                      className={`h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-cream transition ${potColor?.name === c.name ? "ring-forest" : "ring-sand-dark hover:ring-leaf"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {pot?.sizes && pot.sizes.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-stonegray">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {pot.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPotSize(s)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${potSize?.id === s.id ? "bg-forest text-cream" : "bg-white text-ink ring-1 ring-sand-dark hover:ring-leaf"}`}
                    >
                      {s.label}{s.deltaCents > 0 ? ` · +${brl(s.deltaCents)}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------- Etapa 2 -------------------------------- */}
        {step === 2 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-forest">Escolha os materiais</h2>
            <p className="mt-1 text-sm text-stonegray">Componentes para a montagem — um por categoria, na medida certa.</p>
            <div className="mt-5 space-y-6">
              {grouped.map((g) => (
                <div key={g.kind}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-stonegray">{g.label}</p>
                  <p className="mb-2.5 text-[0.72rem] text-stonegray/80">{KIND_PURPOSE[g.kind]}</p>
                  <div className="space-y-2">
                    {g.items.map((m) => {
                      const sel = selectedMaterials.find((x) => x.id === m.id);
                      return (
                        <div
                          key={m.id}
                          className={`flex items-center gap-3 rounded-2xl bg-white p-3 ring-2 transition ${sel ? "ring-forest" : "ring-sand"}`}
                        >
                          <button
                            onClick={() => toggleMaterial(m)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${sel ? "border-forest bg-forest text-cream" : "border-sand-dark"}`}
                            aria-pressed={!!sel}
                            aria-label={`Selecionar ${m.name}`}
                          >
                            {sel && <Check className="h-3.5 w-3.5" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                            <p className="truncate text-[0.7rem] text-stonegray">{m.shortDesc}</p>
                          </div>
                          {sel && (
                            <div className="flex items-center rounded-full border border-sand-dark">
                              <button
                                onClick={() => setSelectedMaterials((c) => c.map((x) => x.id === m.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}
                                className="p-1.5 text-ink/60 hover:text-forest" aria-label="Diminuir"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold">{sel.qty}</span>
                              <button
                                onClick={() => setSelectedMaterials((c) => c.map((x) => x.id === m.id ? { ...x, qty: Math.min(3, x.qty + 1) } : x))}
                                className="p-1.5 text-ink/60 hover:text-forest" aria-label="Aumentar"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <p className="w-16 text-right text-sm font-bold text-forest">
                            {brl(m.priceCents * (sel?.qty ?? 1))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------- Etapa 3 -------------------------------- */}
        {step === 3 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-forest">Escolha a planta ou as flores</h2>
            <p className="mt-1 text-sm text-stonegray">
              Espécies compatíveis com vasos. Combine até 2 para composições.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {plants.map((p) => {
                const selected = selectedPlants.some((x) => x.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlant(p)}
                    className={`group overflow-hidden rounded-2xl bg-white text-left ring-2 transition ${selected ? "ring-forest" : "ring-sand hover:ring-sand-dark"}`}
                    aria-pressed={selected}
                  >
                    <div className="relative aspect-square">
                      <Image src={p.image} alt={p.name} fill sizes="200px" className="object-cover transition duration-500 group-hover:scale-105" />
                      {selected && (
                        <span className="absolute right-2 top-2 rounded-full bg-forest p-1.5 text-cream">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold leading-tight text-ink">{p.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-stonegray">
                        {[p.careLevel && `cuidado ${p.careLevel}`, p.light].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-forest">{brl(p.priceCents)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasFloweryPlant && (
              <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-sand">
                <p className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stonegray">
                  <Flower2 className="h-4 w-4 text-terracotta" /> Arranjo floral — cor das flores
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {FLOWER_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setFlowerColor(c)}
                      aria-label={`Flores ${c.name}`}
                      className={`h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-cream transition ${flowerColor.name === c.name ? "ring-forest" : "ring-sand-dark hover:ring-leaf"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-ink">{flowerColor.name}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------- Etapa 4 -------------------------------- */}
        {step === 4 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-forest">Revise sua composição</h2>
            <p className="mt-1 text-sm text-stonegray">Confira os itens — você pode voltar e ajustar quando quiser.</p>

            <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-sand">
              <ul className="space-y-2.5">
                {summaryLines.map((l, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-ink/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {l}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-sand pt-4">
                <p className="text-sm font-semibold text-ink">Total da composição</p>
                <p className="text-xl font-bold text-forest">{brl(totalCents)}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-stonegray">Quantidade</p>
                <div className="flex items-center rounded-full border border-sand-dark">
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
                className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white transition ${added ? "bg-leaf" : "bg-primary hover:bg-forest"}`}
              >
                {added ? <><Check className="h-4 w-4" /> Adicionado ao carrinho!</> : <><ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho — {brl(totalCents * compositionQty)}</>}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSave}
                  disabled={pending}
                  className="flex items-center justify-center gap-2 rounded-full border border-forest/25 bg-white py-3 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream disabled:opacity-60"
                  title={loggedIn ? "Salvar na sua conta" : "Entre para salvar"}
                >
                  <Save className="h-4 w-4" /> {pending ? "Salvando..." : "Salvar composição"}
                </button>
                <Link
                  href="/loja"
                  className="flex items-center justify-center gap-2 rounded-full border border-forest/25 bg-white py-3 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream"
                >
                  Continuar comprando
                </Link>
              </div>
              {saveMsg && (
                <p className="rounded-xl bg-sand/60 px-4 py-2.5 text-center text-xs font-medium text-ink">
                  {saveMsg}{" "}
                  {!loggedIn && <Link href="/entrar" className="font-bold underline">Entrar</Link>}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Navegação do assistente */}
        <div className="mt-8 flex items-center justify-between border-t border-sand pt-5">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-sand/60 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          {step < 4 ? (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-sand disabled:text-stonegray"
            >
              Avançar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
            >
              Recomeçar montagem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
