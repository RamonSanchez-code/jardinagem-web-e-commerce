import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest text-cream/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Plantas, vasos, kits e paisagismo para tornar seus ambientes mais
              verdes, bonitos e acolhedores.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="rounded-full border border-white/15 p-2.5 transition hover:bg-white/10">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="rounded-full border border-white/15 p-2.5 transition hover:bg-white/10">
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Loja</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Plantas", "/loja?categoria=plantas"],
                ["Flores", "/loja?categoria=flores"],
                ["Vasos", "/loja?categoria=vasos"],
                ["Kits de jardinagem", "/loja?categoria=kits"],
                ["Ferramentas", "/loja?categoria=ferramentas"],
                ["Substratos", "/loja?categoria=substratos"],
                ["Monte seu vaso", "/monte-seu-vaso"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-cream">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Institucional</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Sobre nós", "/sobre"],
                ["Serviços", "/servicos"],
                ["Contato", "/contato"],
                ["Carrinho", "/carrinho"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-cream">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-cream">Atendimento</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss" />{site.address}</li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-moss" />{site.phone}</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-moss" />{site.email}</li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-moss" />{site.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.fullName} · CNPJ {site.cnpj}</p>
          <p>Feito com dedicação e muito verde.</p>
        </div>
      </div>
    </footer>
  );
}
