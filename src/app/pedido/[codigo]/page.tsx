import type { Metadata } from "next";
import { OrderClient } from "./OrderClient";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <OrderClient code={codigo} />;
}
