import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, FlaskConical, Package, Truck, Store, ArrowRight } from "lucide-react";
import { getOrderByCode } from "@/lib/queries";
import { brl } from "@/lib/format";

export const metadata: Metadata = { title: "Pedido confirmado" };
export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const order = await getOrderByCode(codigo);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
      <div className="text-center">
        <span className="inline-flex rounded-full bg-primary/10 p-5 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="font-display mt-6 text-3xl font-semibold text-forest sm:text-4xl">
          Pedido {order.code} registrado!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stonegray">
          Obrigado, {order.customer.name.split(" ")[0]}! Enviamos os detalhes para{" "}
          <strong className="text-ink">{order.customer.email}</strong>. Nossa equipe já
          começou a separar suas plantas.
        </p>
        {order.paymentStatus === "demo_aprovado" && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-terracotta/40 bg-terracotta/10 px-5 py-2 text-xs font-semibold text-terracotta-dark">
            <FlaskConical className="h-4 w-4" /> Pagamento em modo demonstração — nenhuma cobrança real foi feita.
          </p>
        )}
      </div>

      <div className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-sand sm:p-8">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stonegray">
          <Package className="h-4 w-4" /> Itens do pedido
        </h2>
        <ul className="mt-4 divide-y divide-sand">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand/60">
                {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                {item.lines && (
                  <ul className="mt-1 space-y-0.5 text-[0.68rem] text-stonegray">
                    {item.lines.map((l, j) => <li key={j}>· {l}</li>)}
                  </ul>
                )}
                <p className="mt-1 text-xs text-stonegray">{item.qty} × {brl(item.unitPriceCents)}</p>
              </div>
              <p className="text-sm font-bold text-forest">{brl(item.qty * item.unitPriceCents)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-stonegray">Subtotal</dt><dd>{brl(order.subtotalCents)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-stonegray">{order.delivery === "entrega" ? "Frete" : "Retirada"}</dt>
            <dd>{order.shippingCents === 0 ? "Grátis" : brl(order.shippingCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-3 text-base font-bold">
            <dt>Total</dt><dd className="text-forest">{brl(order.totalCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-sand">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stonegray">
            {order.delivery === "entrega" ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}
            {order.delivery === "entrega" ? "Entrega" : "Retirada"}
          </p>
          {order.delivery === "entrega" && order.address ? (
            <p className="mt-2.5 text-sm leading-relaxed text-ink/80">
              {order.address.rua}, {order.address.numero}
              {order.address.complemento ? ` — ${order.address.complemento}` : ""}
              <br />{order.address.bairro} · {order.address.cidade}/{order.address.uf}
              <br />CEP {order.address.cep}
            </p>
          ) : (
            <p className="mt-2.5 text-sm text-ink/80">Retirada na loja — Estrada das Palmeiras, 1200, Cotia/SP.</p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-sand">
          <p className="text-xs font-bold uppercase tracking-wider text-stonegray">Status</p>
          <ol className="mt-2.5 space-y-1.5 text-sm">
            {["recebido", "em_separacao", order.delivery === "entrega" ? "enviado" : "pronto_retirada", "entregue"].map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i === 0 ? "font-semibold text-primary" : "text-stonegray"}`}>
                <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : "bg-sand-dark"}`} />
                {s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/loja" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-forest">
          Continuar comprando <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/conta" className="rounded-full border border-forest/25 px-7 py-3.5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-cream">
          Ver meus pedidos
        </Link>
      </div>
    </div>
  );
}
