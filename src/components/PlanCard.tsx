import { Icon } from '@/components/Icon';
import { formatPrice } from '@/lib/format';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  chosen: boolean;
  onChoose: (plan: Plan) => void;
}

/** Card de plano de assinatura. O plano `featured` usa o vidro escuro. */
export function PlanCard({ plan, chosen, onChoose }: PlanCardProps) {
  return (
    <div className={`plan-card glass${plan.featured ? ' glass-dark' : ''}`}>
      {plan.featured && <span className="badge">Mais escolhido</span>}
      <div className="name">{plan.name}</div>
      <div className="price">
        {formatPrice(plan.price)} {plan.price > 0 && <small>{plan.period}</small>}
      </div>
      <ul>
        {plan.perks.map((perk) => (
          <li key={perk}>
            <Icon name="check" size={13} />
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      <button
        className={`btn ${plan.featured ? 'btn-glass' : 'btn-primary'} full`}
        onClick={() => onChoose(plan)}
      >
        {chosen ? 'Selecionado' : `Escolher ${plan.name}`}
      </button>
    </div>
  );
}
