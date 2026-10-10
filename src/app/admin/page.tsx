import Link from "next/link";
import Image from "next/image";
import {
  Package, ClipboardList, Wrench, Users, Plus, Pencil, Trash2, Eye, EyeOff, Star,
} from "lucide-react";
import {
  getAllProducts, getAllOrders, getAllServices, getAllServiceRequests,
  getCounts, getBenefits, getDeliverySettings,
} from "@/lib/queries";
import {
  saveProductAction, deleteProductAction, toggleProductAction,
  updateOrderStatusAction, saveServiceAction, toggleServiceAction,
  updateRequestStatusAction,
} from "@/lib/admin-actions";
import type { Product } from "@/db/schema";
import { brl } from "@/lib/format";
import { SettingsEditor } from "./SettingsEditor";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-stonegray";

function toReais(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function ProductForm({ p }: { p?: Product }) {
  return (
    <form action={saveProductAction} className="mb-10 rounded-3xl bg-white p-6 ring-1 ring-sand">
      <h2 className="font-display text-lg font-semibold text-forest">
        {p ? `Editar: ${p.name}` : "Novo produto"}
      </h2>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelCls}>Nome *</label>
          <input name="name" defaultValue={p?.name} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Slug (URL)</label>
          <input name="slug" defaultValue={p?.slug} className={inputCls} placeholder="gerado automaticamente" />
        </div>
        <div>
          <label className={labelCls}>Categoria</label>
          <select name="category" defaultValue={p?.category ?? "plantas"} className={inputCls}>
            {["plantas", "flores", "vasos", "kits", "ferramentas", "substratos"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Subcategoria / material</label>
          <input name="subcategory" defaultValue={p?.subcategory} className={inputCls} placeholder="Ex.: Cerâmica, Orquídea..." />
        </div>
        <div>
          <label className={labelCls}>Preço (R$)</label>
          <input name="price" defaultValue={p ? toReais(p.priceCents) : ""} className={inputCls} placeholder="129,90" required />
        </div>
        <div>
          <label className={labelCls}>Preço “de” (R$)</label>
          <input name="compareAt" defaultValue={p?.compareAtCents ? toReais(p.compareAtCents) : ""} className={inputCls} placeholder="opcional" />
        </div>
        <div>
          <label className={labelCls}>Estoque</label>
          <input name="stock" type="number" defaultValue={p?.stock ?? 10} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>URL da imagem</label>
          <input name="image" defaultValue={p?.image} className={inputCls} placeholder="https://..." />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Descrição curta</label>
          <input name="shortDesc" defaultValue={p?.shortDesc} className={inputCls} />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Descrição completa</label>
          <textarea name="description" defaultValue={p?.description} rows={3} className={inputCls} />
        </div>

        <div><label className={labelCls}>Altura aprox.</label><input name="height" defaultValue={p?.height ?? ""} className={inputCls} placeholder="Ex.: 40–60 cm" /></div>
        <div><label className={labelCls}>Luz</label><input name="light" defaultValue={p?.light ?? ""} className={inputCls} placeholder="Ex.: indireta" /></div>
        <div><label className={labelCls}>Rega</label><input name="water" defaultValue={p?.water ?? ""} className={inputCls} placeholder="Ex.: 1x por semana" /></div>
        <div>
          <label className={labelCls}>Ambiente</label>
          <select name="environment" defaultValue={p?.environment ?? ""} className={inputCls}>
            <option value="">—</option><option value="interno">interno</option><option value="externo">externo</option><option value="ambos">ambos</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Nível de cuidado</label>
          <select name="careLevel" defaultValue={p?.careLevel ?? ""} className={inputCls}>
            <option value="">—</option><option value="fácil">fácil</option><option value="moderado">moderado</option><option value="exigente">exigente</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Modelo 3D (personalizador)</label>
          <select name="plantModel" defaultValue={p?.plantModel ?? ""} className={inputCls}>
            <option value="">—</option>
            {["folhagem", "pendente", "palmeira", "cacto", "suculenta", "orquidea", "flores"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Estilo de vaso (3D)</label>
          <select name="potStyle" defaultValue={p?.potStyle ?? ""} className={inputCls}>
            <option value="">—</option>
            {["classico", "bojo", "geometrico", "alto", "tigela"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tipo de material</label>
          <select name="materialKind" defaultValue={p?.materialKind ?? ""} className={inputCls}>
            <option value="">—</option>
            {["substrato", "drenagem", "cobertura", "acessorio"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Cores do vaso (JSON)</label>
          <textarea name="potColors" rows={2} defaultValue={p?.potColors ? JSON.stringify(p.potColors) : ""} className={inputCls} placeholder='[{"name":"Terracota","hex":"#b8754f"}]' />
        </div>
        <div>
          <label className={labelCls}>Tamanhos (JSON)</label>
          <textarea name="sizes" rows={2} defaultValue={p?.sizes ? JSON.stringify(p.sizes) : ""} className={inputCls} placeholder='[{"id":"p","label":"P — 15cm","deltaCents":0}]' />
        </div>
        <div>
          <label className={labelCls}>Itens do kit (JSON)</label>
          <textarea name="kitItems" rows={2} defaultValue={p?.kitItems ? JSON.stringify(p.kitItems) : ""} className={inputCls} placeholder='[{"name":"Vaso de barro M","qty":1}]' />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        {[
          ["active", "Ativo na loja", p?.active ?? true],
          ["inCustomizer", "No personalizador", p?.inCustomizer ?? false],
          ["featured", "Destaque", p?.featured ?? false],
          ["bestseller", "Mais vendido", p?.bestseller ?? false],
          ["isNew", "Novidade", p?.isNew ?? false],
        ].map(([name, label, checked]) => (
          <label key={name as string} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name={name as string} defaultChecked={checked as boolean} className="h-4 w-4 accent-primary" />
            {label as string}
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-forest">
          {p ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        {p && (
          <Link href="/admin?aba=produtos" className="text-sm font-semibold text-stonegray hover:underline">Cancelar</Link>
        )}
      </div>
    </form>
  );
}

const ORDER_STATUSES = ["recebido", "em_separacao", "enviado", "pronto_retirada", "entregue", "cancelado"];
const REQUEST_STATUSES = ["novo", "em_atendimento", "concluido"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; editar?: string }>;
}) {
  const { aba = "resumo", editar } = await searchParams;

  if (aba === "resumo") {
    const counts = await getCounts();
    const orders = await getAllOrders();
    const receita = orders.reduce((a, o) => a + o.totalCents, 0);
    return (
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Package className="h-5 w-5" />, label: "Produtos cadastrados", value: String(counts.products), href: "/admin?aba=produtos" },
            { icon: <ClipboardList className="h-5 w-5" />, label: "Pedidos recebidos", value: String(counts.orders), href: "/admin?aba=pedidos" },
            { icon: <Wrench className="h-5 w-5" />, label: "Solicitações de serviço", value: String(counts.serviceRequests), href: "/admin?aba=servicos" },
            { icon: <Users className="h-5 w-5" />, label: "Receita acumulada", value: brl(receita), href: "/admin?aba=pedidos" },
          ].map((c) => (
            <Link key={c.label} href={c.href} className="rounded-2xl bg-white p-5 ring-1 ring-sand transition hover:ring-primary">
              <span className="inline-flex rounded-full bg-primary/10 p-2.5 text-primary">{c.icon}</span>
              <p className="mt-3 text-2xl font-bold text-forest">{c.value}</p>
              <p className="mt-1 text-xs text-stonegray">{c.label}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-dashed border-sand-dark bg-white/60 p-6 text-sm leading-relaxed text-ink/75">
          <p className="font-bold text-forest">Guia rápido</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Cadastre e atualize produtos, preços, estoque e variações na aba <strong>Produtos</strong> — sem tocar no código.</li>
            <li>Vasos com estilo 3D e cores aparecem automaticamente no <strong>Monte seu vaso</strong>.</li>
            <li>Benefícios da home e regras de entrega são editáveis em <strong>Configurações</strong>.</li>
            <li>Serviços desativados deixam de aparecer na página pública imediatamente.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (aba === "produtos") {
    const all = await getAllProducts();
    const editing = editar ? all.find((p) => p.id === Number(editar)) : undefined;
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-forest">Produtos ({all.length})</h2>
          <Link href="/admin?aba=produtos&editar=novo" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-cream transition hover:bg-primary">
            <Plus className="h-4 w-4" /> Novo produto
          </Link>
        </div>
        {(editing || editar === "novo") && <ProductForm p={editing} />}
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-sand">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-[0.68rem] uppercase tracking-wider text-stonegray">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Exibição</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {all.map((p) => (
                <tr key={p.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-sand/60">
                        {p.image && <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{p.name}</p>
                        <p className="text-[0.68rem] text-stonegray">{p.slug}{p.inCustomizer ? " · 3D" : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/75">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-forest">{brl(p.priceCents)}</td>
                  <td className={`px-4 py-3 font-semibold ${p.stock <= 3 ? "text-terracotta-dark" : "text-ink/75"}`}>{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="active" />
                        <button title={p.active ? "Desativar" : "Ativar"} className={`rounded-full p-1.5 ${p.active ? "bg-primary/10 text-primary" : "bg-sand text-stonegray"}`}>
                          {p.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </form>
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="featured" />
                        <button title="Destaque" className={`rounded-full p-1.5 ${p.featured ? "bg-terracotta/15 text-terracotta-dark" : "bg-sand text-stonegray"}`}>
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin?aba=produtos&editar=${p.id}`} className="rounded-full bg-sand/70 p-2 text-ink transition hover:bg-forest hover:text-cream" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white" title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (aba === "pedidos") {
    const all = await getAllOrders();
    return (
      <div>
        <h2 className="mb-6 font-display text-xl font-semibold text-forest">Pedidos ({all.length})</h2>
        {all.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sand-dark bg-white/60 p-10 text-center text-sm text-stonegray">
            Nenhum pedido ainda. Faça uma compra de teste pela loja.
          </p>
        ) : (
          <div className="space-y-4">
            {all.map((o) => (
              <article key={o.id} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-forest">{o.code}</p>
                    <p className="text-xs text-stonegray">
                      {o.customer.name} · {o.customer.email} · {new Date(o.createdAt).toLocaleString("pt-BR")}
                    </p>
                    {o.paymentStatus === "demo_aprovado" && (
                      <span className="mt-1 inline-block rounded-full bg-terracotta/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-terracotta-dark">pagamento demo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-forest">{brl(o.totalCents)}</p>
                    <form action={updateOrderStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} className="rounded-lg border border-sand-dark bg-white px-2.5 py-1.5 text-xs">
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                      <button className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-primary">OK</button>
                    </form>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 border-t border-sand pt-3 text-sm text-ink/75">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      · {it.qty}× {it.name} — {brl(it.unitPriceCents)}
                      {it.lines && <span className="block pl-4 text-[0.7rem] text-stonegray">{it.lines.join(" · ")}</span>}
                    </li>
                  ))}
                </ul>
                {o.address && (
                  <p className="mt-2 text-xs text-stonegray">
                    Entrega: {o.address.rua}, {o.address.numero} — {o.address.bairro}, {o.address.cidade}/{o.address.uf}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (aba === "servicos") {
    const [all, requests] = await Promise.all([getAllServices(), getAllServiceRequests()]);
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 font-display text-xl font-semibold text-forest">Serviços oferecidos</h2>
          <div className="space-y-4">
            {all.map((s) => (
              <article key={s.id} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
                <form action={saveServiceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="image" value={s.image} />
                  <div className="flex items-center justify-between gap-3">
                    <input name="name" defaultValue={s.name} className={`${inputCls} font-semibold`} />
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-ink/70">
                      <input type="checkbox" name="active" defaultChecked={s.active} className="h-4 w-4 accent-primary" /> Oferecido
                    </label>
                  </div>
                  <textarea name="description" defaultValue={s.description} rows={2} className={`${inputCls} mt-3`} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input name="priceLabel" defaultValue={s.priceLabel} className={inputCls} placeholder="Preço / condição" />
                    <input name="area" defaultValue={s.area} className={inputCls} placeholder="Área atendida" />
                  </div>
                  <button className="mt-4 rounded-full bg-forest px-5 py-2 text-xs font-semibold text-cream hover:bg-primary">Salvar serviço</button>
                </form>
                <form action={toggleServiceAction} className="mt-2">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs font-semibold text-stonegray underline-offset-2 hover:underline">
                    {s.active ? "Desativar na página pública" : "Reativar na página pública"}
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-6 font-display text-xl font-semibold text-forest">Solicitações ({requests.length})</h2>
          {requests.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand-dark bg-white/60 p-10 text-center text-sm text-stonegray">
              Nenhuma solicitação recebida ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <article key={r.id} className="rounded-2xl bg-white p-5 ring-1 ring-sand">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{r.serviceName} — {r.name}</p>
                    <form action={updateRequestStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="rounded-lg border border-sand-dark bg-white px-2.5 py-1.5 text-xs">
                        {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                      <button className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-primary">OK</button>
                    </form>
                  </div>
                  <p className="mt-1 text-xs text-stonegray">{r.email} · {r.phone} · {r.city}</p>
                  <p className="mt-2 rounded-xl bg-cream p-3 text-sm text-ink/80">{r.message}</p>
                  <p className="mt-2 text-[0.68rem] text-stonegray">{new Date(r.createdAt).toLocaleString("pt-BR")}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // config
  const [benefits, delivery] = await Promise.all([getBenefits(), getDeliverySettings()]);
  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold text-forest">Configurações da loja</h2>
      <SettingsEditor
        initialBenefits={JSON.parse(JSON.stringify(benefits))}
        initialDelivery={JSON.parse(JSON.stringify(delivery))}
      />
    </div>
  );
}
