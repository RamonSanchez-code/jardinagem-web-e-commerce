"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Truck, Store, User, MapPin, CreditCard, CircleAlert, FlaskConical, ArrowLeft } from "lucide-react";
import { useCart, cartSubtotal, cartCount } from "@/lib/cart";
import { brl } from "@/lib/format";
import { placeOrderAction, type CheckoutInput } from "@/lib/actions";
import type { DeliverySettings } from "@/db/schema";

const inputCls =
  "w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function CheckoutClient({
  delivery,
  defaultCustomer,
}: {
  delivery: DeliverySettings;
  defaultCustomer?: { name: string; email: string };
}) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(defaultCustomer?.name ?? "");
  const [email, setEmail] = useState(defaultCustomer?.email ?? "");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"entrega" | "retirada">("entrega");
  const [addr, setAddr] = useState({ cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });

  useEffect(() => setMounted(true), []);
  const subtotal = cartSubtotal(items);
  const shipping = mode === "retirada" ? 0 : subtotal >= delivery.freeAboveCents ? 0 : delivery.baseFeeCents;
  const total = subtotal + shipping;

  const submit = () => {
    setError(null);
    const input: CheckoutInput = {
      customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
      delivery: mode,
      address: mode === "entrega" ? addr : undefined,
      items: items.map((i) =>
        i.kind === "produto"
          ? { kind: "produto", productId: i.productId, qty: i.qty }
          : { kind: "personalizado", qty: i.qty, custom: i.custom }
      ),
      paymentMethod: "demo",
    };
    startTransition(async () => {
      const res = await placeOrderAction(input);
      if (res.ok) {
        clear();
        router.push(`/pedido/${res.code}`);
      } else {
        setError(res.error);
      }
    });
  };

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-3xl bg-sand/60" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-sand-dark bg-white/60 py-20 text-center">
        <p className="font-display text-xl font-semibold text-ink">Seu carrinho está vazio</p>
        <Link href="/loja" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-forest">
          <ArrowLeft className="h-4 w-4" /> Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        {/* 1. Identificação */}
        <section className="rounded-3xl bg-white p-6 ring-1 ring-sand">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-forest">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs text-cream">1</span>
            <User className="h-4 w-4" /> Identificação
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-ink">Nome completo</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">E-mail</label>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Telefone / WhatsApp</label>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" autoComplete="tel" />
            </div>
          </div>
        </section>

        {/* 2. Entrega ou retirada */}
        <section className="rounded-3xl bg-white p-6 ring-1 ring-sand">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-forest">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs text-cream">2</span>
            <Truck className="h-4 w-4" /> Entrega ou retirada
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setMode("entrega")}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${mode === "entrega" ? "border-forest bg-forest/5" : "border-sand-dark"}`}
              aria-pressed={mode === "entrega"}
            >
              <Truck className={`mt-0.5 h-5 w-5 ${mode === "entrega" ? "text-primary" : "text-stonegray"}`} />
              <div>
                <p className="text-sm font-bold text-ink">Entrega programada</p>
                <p className="mt-1 text-xs leading-relaxed text-stonegray">{delivery.note}</p>
                <p className="mt-1.5 text-xs font-bold text-primary">
                  {subtotal >= delivery.freeAboveCents ? "Grátis neste pedido" : `${brl(delivery.baseFeeCents)} — grátis acima de ${brl(delivery.freeAboveCents)}`}
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("retirada")}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${mode === "retirada" ? "border-forest bg-forest/5" : "border-sand-dark"}`}
              aria-pressed={mode === "retirada"}
            >
              <Store className={`mt-0.5 h-5 w-5 ${mode === "retirada" ? "text-primary" : "text-stonegray"}`} />
              <div>
                <p className="text-sm font-bold text-ink">Retirada na loja</p>
                <p className="mt-1 text-xs leading-relaxed text-stonegray">{delivery.pickupNote}</p>
                <p className="mt-1.5 text-xs font-bold text-primary">Sem custo</p>
              </div>
            </button>
          </div>

          {mode === "entrega" && (
            <div className="mt-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
                <MapPin className="h-4 w-4 text-primary" /> Endereço de entrega
              </h3>
              <div className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">CEP</label>
                  <input className={inputCls} value={addr.cep} onChange={(e) => setAddr({ ...addr, cep: e.target.value })} placeholder="00000-000" autoComplete="postal-code" />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Rua</label>
                  <input className={inputCls} value={addr.rua} onChange={(e) => setAddr({ ...addr, rua: e.target.value })} placeholder="Nome da rua" autoComplete="street-address" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Número</label>
                  <input className={inputCls} value={addr.numero} onChange={(e) => setAddr({ ...addr, numero: e.target.value })} placeholder="123" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Complemento (opcional)</label>
                  <input className={inputCls} value={addr.complemento} onChange={(e) => setAddr({ ...addr, complemento: e.target.value })} placeholder="Apto, bloco..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Bairro</label>
                  <input className={inputCls} value={addr.bairro} onChange={(e) => setAddr({ ...addr, bairro: e.target.value })} placeholder="Bairro" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-ink">Cidade / UF</label>
                  <div className="grid grid-cols-[1fr_4.5rem] gap-3">
                    <input className={inputCls} value={addr.cidade} onChange={(e) => setAddr({ ...addr, cidade: e.target.value })} placeholder="Cidade" />
                    <input className={inputCls} maxLength={2} value={addr.uf} onChange={(e) => setAddr({ ...addr, uf: e.target.value.toUpperCase() })} placeholder="SP" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. Pagamento (demonstração) */}
        <section className="rounded-3xl bg-white p-6 ring-1 ring-sand">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-forest">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs text-cream">3</span>
            <CreditCard className="h-4 w-4" /> Pagamento
          </h2>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-terracotta/50 bg-terracotta/5 p-4">
            <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-dark" />
            <div className="text-sm">
              <p className="font-bold text-terracotta-dark">Modo de demonstração</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">
                Nenhum provedor de pagamento está conectado neste ambiente. Ao confirmar,
                o pedido é registrado com status de pagamento <strong>“demonstração aprovada”</strong> —
                sem cobrança real. Para produção, integre um gateway (Stripe, Mercado Pago, etc.)
                com as credenciais no servidor.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Resumo */}
      <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-sand lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-semibold text-forest">
          Seu pedido <span className="text-sm font-normal text-stonegray">({cartCount(items)} itens)</span>
        </h2>
        <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand/60">
                {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{i.name}</p>
                <p className="text-[0.68rem] text-stonegray">{i.qty} × {brl(i.unitPriceCents)}</p>
              </div>
              <p className="text-xs font-bold text-forest">{brl(i.qty * i.unitPriceCents)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2.5 border-t border-sand pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stonegray">Subtotal</dt><dd className="font-semibold">{brl(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stonegray">{mode === "entrega" ? "Frete" : "Retirada"}</dt>
            <dd className="font-semibold">{shipping === 0 ? "Grátis" : brl(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-3 text-base">
            <dt className="font-bold">Total</dt>
            <dd className="font-bold text-forest">{brl(total)}</dd>
          </div>
        </dl>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={pending}
          className="mt-6 w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-60"
        >
          {pending ? "Registrando pedido..." : `Confirmar pedido — ${brl(total)}`}
        </button>
        <Link href="/carrinho" className="mt-3 block text-center text-sm font-semibold text-forest underline-offset-4 hover:underline">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
