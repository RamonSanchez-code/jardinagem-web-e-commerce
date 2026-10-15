const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos para R$ 0,00 */
export function brl(cents: number): string {
  return brlFormatter.format(cents / 100);
}

export function generateOrderCode(): string {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `NP-${n}`;
}
