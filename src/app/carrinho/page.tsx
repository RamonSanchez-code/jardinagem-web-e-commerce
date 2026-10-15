import type { Metadata } from "next";
import { CartClient } from "./CartClient";
import { getDeliverySettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Carrinho" };

export default async function CarrinhoPage() {
  const delivery = await getDeliverySettings();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Sua cesta</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">Carrinho</h1>
      </header>
      <CartClient delivery={delivery} />
    </div>
  );
}
