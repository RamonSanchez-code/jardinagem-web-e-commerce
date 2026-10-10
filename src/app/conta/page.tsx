import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Flower2, LogOut, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getOrdersByUser, getCompositionsByUser } from "@/lib/queries";
import { logoutAction } from "@/lib/actions";
import { brl } from "@/lib/format";
import { CompositionCard } from "./CompositionCard";

export const metadata: Metadata = { title: "Minha conta" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  recebido: "Recebido",
  em_separacao: "Em separação",
  enviado: "Enviado",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default async function ContaPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  const [userOrders, userCompositions] = await Promise.all([
    getOrdersByUser(session.uid),
    getCompositionsByUser(session.uid),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Sua área</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-forest">Olá, {session.name.split(" ")[0]}!</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-stonegray">
            <UserIcon className="h-4 w-4" /> {session.email}
            {session.role === "admin" && (
              <Link href="/admin" className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-[0.7rem] font-bold text-cream hover:bg-primary">
                <ShieldCheck className="h-3 w-3" /> Painel admin
              </Link>
            )}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-forest hover:text-cream">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </div>

      {/* Pedidos */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-bold text-forest">
          <Package className="h-5 w-5" /> Meus pedidos
        </h2>
        {userOrders.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-sand-dark bg-white/60 p-10 text-center">
            <p className="text-sm text-stonegray">Você ainda não fez nenhum pedido.</p>
            <Link href="/loja" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Começar a comprar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {userOrders.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-forest">{o.code}</p>
                    <p className="text-xs text-stonegray">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-ink/75">
                  {o.items.map((it, i) => (
                    <li key={i}>· {it.qty}× {it.name}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-sand pt-3 text-right text-sm font-bold text-forest">
                  Total: {brl(o.totalCents)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Composições salvas */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-bold text-forest">
          <Flower2 className="h-5 w-5" /> Composições salvas
        </h2>
        {userCompositions.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-sand-dark bg-white/60 p-10 text-center">
            <p className="text-sm text-stonegray">Nenhuma composição salva ainda.</p>
            <Link href="/monte-seu-vaso" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Montar meu primeiro vaso <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {userCompositions.map((c) => (
              <CompositionCard key={c.id} composition={JSON.parse(JSON.stringify(c))} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
