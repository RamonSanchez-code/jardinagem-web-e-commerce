"use client";

import { useActionState } from "react";
import { Send, CircleAlert, CheckCircle2 } from "lucide-react";
import { serviceRequestAction } from "@/lib/actions";

const inputCls =
  "w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function ServiceForm({
  services,
  preselect,
  title = "Solicite um orçamento",
}: {
  services: { id: number; name: string }[];
  preselect?: string;
  title?: string;
}) {
  const [state, formAction, pending] = useActionState(serviceRequestAction, {});
  const selected = services.find((s) => s.name === preselect);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-sand">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <p className="font-display text-xl font-semibold text-forest">{state.success}</p>
        <p className="text-sm text-stonegray">Responderemos pelo e-mail ou telefone informado.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-3xl bg-white p-6 ring-1 ring-sand sm:p-8">
      <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="serviceSelect">Serviço de interesse</label>
          <select
            id="serviceSelect"
            name="serviceName"
            defaultValue={selected?.name ?? "Contato / Outros"}
            className={inputCls}
          >
            {services.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
            <option value="Contato / Outros">Contato / Outros</option>
          </select>
          <input type="hidden" name="serviceId" value={selected?.id ?? ""} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="sf-name">Nome</label>
          <input id="sf-name" name="name" className={inputCls} placeholder="Seu nome" required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="sf-city">Cidade / Bairro</label>
          <input id="sf-city" name="city" className={inputCls} placeholder="Cotia, Granja Viana..." />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="sf-email">E-mail</label>
          <input id="sf-email" name="email" type="email" className={inputCls} placeholder="voce@email.com" required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="sf-phone">Telefone / WhatsApp</label>
          <input id="sf-phone" name="phone" className={inputCls} placeholder="(11) 99999-0000" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="sf-message">Como podemos ajudar?</label>
          <textarea
            id="sf-message"
            name="message"
            rows={4}
            className={inputCls}
            placeholder="Conte sobre seu espaço, as plantas que você procura ou o serviço desejado..."
            required
          />
        </div>
      </div>
      {state?.error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <CircleAlert className="h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-60"
      >
        <Send className="h-4 w-4" /> {pending ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
