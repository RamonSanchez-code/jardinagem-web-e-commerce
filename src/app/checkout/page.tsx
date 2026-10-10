import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import { getDeliverySettings } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Finalizar compra" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [delivery, session] = await Promise.all([getDeliverySettings(), getSession()]);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-terracotta">Quase lá</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest sm:text-4xl">Finalizar compra</h1>
      </header>
      <CheckoutClient
        delivery={delivery}
        defaultCustomer={
          session ? { name: session.name, email: session.email } : undefined
        }
      />
    </div>
  );
}
