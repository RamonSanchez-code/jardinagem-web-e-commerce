import Link from "next/link";
import { site } from "@/lib/site";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 36c0-9 1.5-15.5 4.5-20.5M24 36c0-9-1.5-15.5-4.5-20.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 36V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28.5 15.5c3.8-.8 6.5-4 6.5-8-4 0-7.2 2.2-8 6"
        fill="currentColor"
      />
      <path
        d="M19.5 15.5c-3.8-.8-6.5-4-6.5-8 4 0 7.2 2.2 8 6"
        fill="currentColor"
      />
      <path
        d="M29.2 24.5c4.2-.6 7.3-4.2 7.3-8.5-4.4 0-7.8 2.4-8.8 6.4"
        fill="currentColor"
        opacity=".7"
      />
      <path
        d="M18.8 24.5c-4.2-.6-7.3-4.2-7.3-8.5 4.4 0 7.8 2.4 8.8 6.4"
        fill="currentColor"
        opacity=".7"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${light ? "text-cream" : "text-forest"}`}
      aria-label={site.fullName}
    >
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="leading-none">
        <span className="font-display block text-[1.35rem] font-semibold tracking-tight">
          {site.name}
        </span>
        <span className="block text-[0.62rem] font-medium uppercase tracking-[0.34em] opacity-80">
          {site.suffix}
        </span>
      </span>
    </Link>
  );
}
