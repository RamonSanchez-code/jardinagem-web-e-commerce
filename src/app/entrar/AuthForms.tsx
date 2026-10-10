"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, CircleAlert } from "lucide-react";
import { loginAction, registerAction } from "@/lib/actions";

const inputCls =
  "w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function AuthForms({ mode }: { mode: "login" | "cadastro" }) {
  const [loginState, loginForm, loginPending] = useActionState(loginAction, {});
  const [regState, regForm, regPending] = useActionState(registerAction, {});

  if (mode === "cadastro") {
    return (
      <div className="rounded-3xl bg-white p-7 ring-1 ring-sand">
        <form action={regForm} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="name">Nome completo</label>
            <input id="name" name="name" className={inputCls} placeholder="Seu nome" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" className={inputCls} placeholder="voce@email.com" required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" className={inputCls} placeholder="Mínimo 6 caracteres" minLength={6} required />
          </div>
          {regState?.error && (
            <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              <CircleAlert className="h-4 w-4 shrink-0" /> {regState.error}
            </p>
          )}
          <button
            disabled={regPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" /> {regPending ? "Criando..." : "Criar minha conta"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-stonegray">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-7 ring-1 ring-sand">
      <form action={loginForm} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="lemail">E-mail</label>
          <input id="lemail" name="email" type="email" className={inputCls} placeholder="voce@email.com" required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="lpassword">Senha</label>
          <input id="lpassword" name="password" type="password" className={inputCls} placeholder="Sua senha" required />
        </div>
        {loginState?.error && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <CircleAlert className="h-4 w-4 shrink-0" /> {loginState.error}
          </p>
        )}
        <button
          disabled={loginPending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" /> {loginPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-stonegray">
        Ainda não tem conta?{" "}
        <Link href="/entrar?modo=cadastro" className="font-semibold text-primary hover:underline">Criar agora</Link>
      </p>
    </div>
  );
}
