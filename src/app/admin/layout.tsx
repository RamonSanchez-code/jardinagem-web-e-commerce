import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Wrench, Settings, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { getCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "resumo", label: "Resumo", icon: LayoutDashboard },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "pedidos", label: "Pedidos", icon: ClipboardList },
  { key: "servicos", label: "Serviços", icon: Wrench },
  { key: "config", label: "Configurações", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/entrar");
  const counts = await getCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Área restrita</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-forest sm:text-3xl">Painel administrativo</h1>
          <p className="mt-1 text-xs text-stonegray">
            {counts.products} produtos · {counts.orders} pedidos · {counts.serviceRequests} solicitações · {counts.users} contas
          </p>
        </div>
        <form action={logoutAction}>
          <button className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-4 py-2 text-xs font-semibold text-forest transition hover:bg-forest hover:text-cream">
            <LogOut className="h-3.5 w-3.5" /> Sair ({session.name.split(" ")[0]})
          </button>
        </form>
      </div>

      <nav className="mb-8 mt-6 flex flex-wrap gap-2" aria-label="Seções do painel">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?aba=${t.key}`}
            className="inline-flex items-center gap-2 rounded-full border border-sand-dark bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-forest hover:bg-forest hover:text-cream"
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
