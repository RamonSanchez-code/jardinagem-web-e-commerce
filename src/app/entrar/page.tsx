import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForms } from "./AuthForms";

export const metadata: Metadata = { title: "Entrar ou criar conta" };
export const dynamic = "force-dynamic";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/conta");
  const { modo } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pb-20 pt-32 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Sua conta</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest">
          {modo === "cadastro" ? "Criar conta" : "Bem-vindo(a) de volta"}
        </h1>
        <p className="mt-2 text-sm text-stonegray">
          Acompanhe pedidos e salve suas composições personalizadas.
        </p>
      </header>
      <Suspense>
        <AuthForms mode={modo === "cadastro" ? "cadastro" : "login"} />
      </Suspense>
    </div>
  );
}
