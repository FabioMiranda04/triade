import { useEffect, useState } from 'react';
import { SectionHead } from '@/components/SectionHead';
import { Kebab } from '@/components/Kebab';
import { PlanCard } from '@/components/PlanCard';
import { PlanEditSheet } from '@/components/PlanEditSheet';
import { Skeleton } from '@/components/Skeleton';
import { Mark } from '@/components/Brand';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { db } from '@/lib/db';
import type { Plan } from '@/types';

/** Tela Planos — assinaturas da comunidade + cota de patrocínio. */
export default function Planos() {
  const { showToast } = useToast();
  const { requireAuth } = useAuth();
  const [versao, setVersao] = useState(0);
  const { data: plans, loading } = useAsyncData<Plan[]>(() => db.getPlans(), [], versao);
  const [chosen, setChosen] = useState<string | null>(null);
  const podeEditar = usePodeEditar();
  const [editando, setEditando] = useState<Plan | null>(null);

  useEffect(() => {
    db.getChosenPlan().then(setChosen);
  }, []);

  async function handleChoose(plan: Plan) {
    if (!requireAuth()) return;

    // SPEC-002 fase 0. A aba abre ANTES do `await`: depois dele o navegador
    // já não enxerga o clique como origem e o bloqueador de pop-up engole a
    // janela. `null` = bloqueada, ou plano sem link ainda.
    const aba = plan.paymentUrl ? window.open(plan.paymentUrl, '_blank', 'noopener') : null;

    // A escolha continua sendo gravada mesmo com link: é a intenção
    // (`plan_selections`), que a SPEC-002 D5 mantém separada do pagamento.
    await db.choosePlan(plan.id);
    setChosen(plan.id);

    if (plan.paymentUrl && !aba) {
      showToast('Libere os pop-ups para abrir o pagamento');
      return;
    }
    showToast(aba ? `Abrindo o pagamento do ${plan.name}…` : `Plano ${plan.name} selecionado!`);
  }

  function handleSaved() {
    setEditando(null);
    setVersao((v) => v + 1);
    showToast('Plano publicado para todo mundo ✓');
  }

  return (
    <section className="panel">
      <SectionHead eyebrow="Assinatura" title="Planos Tríade" />

      <div className="card-note glass-strong">
        <Mark size={16} />
        <span>
          Valores sugeridos para validação — estrutura pronta para ligar ao banco de dados.
        </span>
      </div>

      {loading ? (
        <Skeleton rows={3} height={190} />
      ) : (
        plans.map((plan) => (
          <div className="plan-wrap" key={plan.id}>
            {podeEditar && (
              <Kebab
                label={`Opções do plano ${plan.name}`}
                actions={[{ label: 'Editar', icon: 'edit', onClick: () => setEditando(plan) }]}
              />
            )}
            <PlanCard plan={plan} chosen={chosen === plan.id} onChoose={handleChoose} />
          </div>
        ))
      )}

      <article className="post glass sponsor-card">
        <div className="eyebrow">Para marcas</div>
        <h3>Seja patrocinadora</h3>
        <p>1 patrocinadora por segmento · logo nos materiais · ativação no evento.</p>
        <div className="sponsor-row">
          <div className="value">R$ 1.500</div>
          <button
            className="btn btn-primary"
            onClick={() => showToast('Em breve: formulário de patrocínio')}
          >
            Quero patrocinar
          </button>
        </div>
      </article>

      {editando && (
        <PlanEditSheet plan={editando} onClose={() => setEditando(null)} onSaved={handleSaved} />
      )}
    </section>
  );
}
