import { HeroLoader } from "@/components/hero3d/HeroLoader";

/**
 * Página temporária para visualizar apenas o novo hero (varanda com scroll),
 * sem depender do banco de dados que a home (/) usa para listar produtos.
 * Pode ser removida com segurança: não é linkada em nenhum lugar do site.
 */
export default function PreviewHeroPage() {
  return (
    <main>
      <HeroLoader />
      <div id="conteudo" className="flex min-h-[40vh] items-center justify-center bg-cream">
        <p className="text-sm text-ink/60">Fim da pré-visualização do hero.</p>
      </div>
    </main>
  );
}
