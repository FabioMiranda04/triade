import { useEffect, useState } from 'react';
import { SectionHead } from '@/components/SectionHead';
import { PlanCard } from '@/components/PlanCard';
import { Skeleton } from '@/components/Skeleton';
import { Mark } from '@/components/Brand';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import type { Plan } from '@/types';

/** Tela Planos — assinaturas da comunidade + cota de patrocínio. */
export default function Planos() {
  const { showToast } = useToast();
  const { requireAuth } = useAuth();
  const { data: plans, loading } = useAsyncData<Plan[]>(() => db.getPlans(), []);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    db.getChosenPlan().then(setChosen);
  }, []);

  async function handleChoose(plan: Plan) {
    if (!requireAuth()) return;
    await db.choosePlan(plan.id);
    setChosen(plan.id);
    showToast(`Plano ${plan.name} selecionado!`);
  }

  return (
    <section className="panel">
      <SectionHead first eyebrow="Assinatura" title="Planos Tríade" />

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
          <PlanCard key={plan.id} plan={plan} chosen={chosen === plan.id} onChoose={handleChoose} />
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
    </section>
  );
}
