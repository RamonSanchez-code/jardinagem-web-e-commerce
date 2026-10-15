import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { site } from "@/lib/site";
import { getActiveServices } from "@/lib/queries";
import { ServiceForm } from "@/components/site/ServiceForm";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Nature Paisagismo — dúvidas sobre plantas, pedidos, serviços e parcerias.",
};

export default async function ContatoPage() {
  const services = await getActiveServices();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mb-12 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Fale conosco</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">Contato</h1>
        <p className="mt-3 text-sm leading-relaxed text-stonegray sm:text-base">
          Dúvidas sobre cuidados, pedidos, entregas ou serviços? Escreva para nós —
          respondemos em horário comercial.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
        <aside className="space-y-4">
          {[
            { icon: <MapPin className="h-5 w-5" />, t: "Endereço", d: site.address },
            { icon: <Phone className="h-5 w-5" />, t: "Telefone", d: site.phone },
            { icon: <Mail className="h-5 w-5" />, t: "E-mail", d: site.email },
            { icon: <Clock className="h-5 w-5" />, t: "Horário", d: site.hours },
          ].map((c) => (
            <div key={c.t} className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-sand">
              <span className="rounded-full bg-primary/10 p-3 text-primary">{c.icon}</span>
              <div>
                <h2 className="text-sm font-bold text-ink">{c.t}</h2>
                <p className="mt-1 text-sm text-stonegray">{c.d}</p>
              </div>
            </div>
          ))}
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest py-4 text-sm font-semibold text-cream transition hover:bg-primary"
          >
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        </aside>
        <ServiceForm services={services.map((s) => ({ id: s.id, name: s.name }))} title="Envie sua mensagem" />
      </div>
    </div>
  );
}
