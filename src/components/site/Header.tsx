"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Leaf } from "lucide-react";
import { Logo } from "./Logo";
import { useCart, cartCount } from "@/lib/cart";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/loja?categoria=plantas", label: "Plantas" },
  { href: "/loja?categoria=flores", label: "Flores" },
  { href: "/loja?categoria=vasos", label: "Vasos" },
  { href: "/loja?categoria=kits", label: "Kits" },
  { href: "/monte-seu-vaso", label: "Monte seu vaso" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const items = useCart((s) => s.items);

  const isHome = pathname === "/";
  const solid = !isHome || scrolled || open;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const count = mounted ? cartCount(items) : 0;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-forest/95 shadow-lg shadow-black/10 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4 lg:h-[4.5rem]">
          {/* Mobile menu button */}
          <button
            className="rounded-full p-2 text-cream transition hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="[&>*]:text-cream">
            <Logo light />
          </div>

          {/* Search */}
          <form
            className="mx-auto hidden w-full max-w-sm items-center md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(query.trim() ? `/loja?q=${encodeURIComponent(query.trim())}` : "/loja");
            }}
            role="search"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plantas, vasos, kits..."
                className="h-10 w-full rounded-full border border-white/15 bg-white/10 pl-10 pr-4 text-sm text-cream placeholder:text-cream/50 outline-none transition focus:border-white/40 focus:bg-white/15"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              href="/monte-seu-vaso"
              className="mr-1 hidden items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-white transition hover:bg-terracotta-dark xl:flex"
            >
              <Leaf className="h-3.5 w-3.5" />
              Monte seu vaso
            </Link>
            <Link
              href="/carrinho"
              className="relative rounded-full p-2.5 text-cream transition hover:bg-white/10"
              aria-label={`Carrinho, ${count} itens`}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[0.65rem] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center justify-center gap-1 pb-3 lg:flex" aria-label="Navegação principal">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={`rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium tracking-wide transition ${
                (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href.split("?")[0]) && n.href !== "/")
                  ? "bg-white/15 text-cream"
                  : "text-cream/75 hover:bg-white/10 hover:text-cream"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden bg-forest transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <nav className="space-y-1 px-4 pb-6 pt-2" aria-label="Menu móvel">
          <form
            className="pb-2 md:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push(query.trim() ? `/loja?q=${encodeURIComponent(query.trim())}` : "/loja");
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar na loja..."
                className="h-11 w-full rounded-full border border-white/15 bg-white/10 pl-10 pr-4 text-sm text-cream placeholder:text-cream/50 outline-none"
              />
            </div>
          </form>
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="block rounded-xl px-4 py-2.5 text-[0.95rem] font-medium text-cream/85 transition hover:bg-white/10 hover:text-cream"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
