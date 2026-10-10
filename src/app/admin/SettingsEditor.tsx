"use client";

import { useState, useTransition } from "react";
import { Save, Truck, Sparkles } from "lucide-react";
import { saveSettingsAction } from "@/lib/admin-actions";
import type { Benefit, DeliverySettings } from "@/db/schema";
import { brl } from "@/lib/format";

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-stonegray";

const ICONS = [
  { value: "truck", label: "Caminhão (entrega)" },
  { value: "leaf", label: "Folha (qualidade)" },
  { value: "package", label: "Pacote (kits)" },
  { value: "message", label: "Balão (atendimento)" },
];

export function SettingsEditor({
  initialBenefits,
  initialDelivery,
}: {
  initialBenefits: Benefit[];
  initialDelivery: DeliverySettings;
}) {
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits);
  const [delivery, setDelivery] = useState<DeliverySettings>(initialDelivery);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const saveBenefits = () =>
    startTransition(async () => {
      await saveSettingsAction({ type: "benefits", value: benefits.filter((b) => b.title) });
      setMsg("Benefícios da página inicial atualizados!");
      setTimeout(() => setMsg(null), 2600);
    });

  const saveDelivery = () =>
    startTransition(async () => {
      await saveSettingsAction({ type: "delivery", value: delivery });
      setMsg("Regras de entrega atualizadas!");
      setTimeout(() => setMsg(null), 2600);
    });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Benefícios da home */}
      <section className="rounded-3xl bg-white p-6 ring-1 ring-sand">
        <h3 className="flex items-center gap-2 text-base font-bold text-forest">
          <Sparkles className="h-4 w-4" /> Benefícios da página inicial
        </h3>
        <div className="mt-5 space-y-5">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-2xl border border-sand p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Título</label>
                  <input
                    className={inputCls}
                    value={b.title}
                    onChange={(e) => setBenefits((c) => c.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Ícone</label>
                  <select
                    className={inputCls}
                    value={b.icon}
                    onChange={(e) => setBenefits((c) => c.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))}
                  >
                    {ICONS.map((ic) => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Texto</label>
                  <input
                    className={inputCls}
                    value={b.text}
                    onChange={(e) => setBenefits((c) => c.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={saveBenefits}
          disabled={pending}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-semibold text-cream transition hover:bg-primary disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> Salvar benefícios
        </button>
      </section>

      {/* Entrega */}
      <section className="rounded-3xl bg-white p-6 ring-1 ring-sand">
        <h3 className="flex items-center gap-2 text-base font-bold text-forest">
          <Truck className="h-4 w-4" /> Entrega e retirada
        </h3>
        <div className="mt-5 space-y-4">
          <div>
            <label className={labelCls}>Condição de entrega (nota pública)</label>
            <textarea
              className={inputCls}
              rows={2}
              value={delivery.note}
              onChange={(e) => setDelivery({ ...delivery, note: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Taxa base (centavos) — {brl(delivery.baseFeeCents)}</label>
              <input
                className={inputCls}
                type="number"
                value={delivery.baseFeeCents}
                onChange={(e) => setDelivery({ ...delivery, baseFeeCents: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className={labelCls}>Frete grátis acima de — {brl(delivery.freeAboveCents)}</label>
              <input
                className={inputCls}
                type="number"
                value={delivery.freeAboveCents}
                onChange={(e) => setDelivery({ ...delivery, freeAboveCents: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Nota de retirada</label>
            <textarea
              className={inputCls}
              rows={2}
              value={delivery.pickupNote}
              onChange={(e) => setDelivery({ ...delivery, pickupNote: e.target.value })}
            />
          </div>
        </div>
        <button
          onClick={saveDelivery}
          disabled={pending}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-semibold text-cream transition hover:bg-primary disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> Salvar entrega
        </button>
      </section>

      {msg && (
        <p className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream shadow-xl">
          {msg}
        </p>
      )}
    </div>
  );
}
