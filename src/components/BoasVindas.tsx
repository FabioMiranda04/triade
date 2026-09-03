import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { ModalOverlay } from '@/components/ModalOverlay';
import { db } from '@/lib/db';
import { getPref, setPref } from '@/lib/db/prefs';
import { formatPrice } from '@/lib/format';
import type { Plan } from '@/types';

const PREF = 'boas_vindas_vista';

/**
 * Convite para virar membra, na primeira abertura do app.
 *
 * Três regras que decidem se ele aparece, e todas existem para o convite
 * não virar praga:
 *
 * 1. **uma vez por aparelho.** Fechou, não volta — a preferência fica
 *    gravada mesmo se a pessoa não clicar em nada. Um pop-up que reaparece
 *    a cada abertura não convence ninguém, ensina a fechar rápido;
 * 2. **nunca para quem já escolheu plano.** Vender de novo para quem já
 *    comprou é o jeito mais rápido de parecer que o app não sabe quem ela é;
 * 3. **depois da tela desenhar.** Entra com 900ms de atraso: cair por cima
 *    de uma tela que ainda está montando lê como erro, não como convite.
 *
 * Os benefícios não são texto fixo: saem do plano em destaque
 * (`featured`), então corrigir uma vantagem em Planos → "..." → Editar já
 * corrige o convite. Duas fontes de verdade para a mesma lista sairiam de
 * sincronia na primeira alteração.
 */
export function BoasVindas() {
  const navigate = useNavigate();
  const [plano, setPlano] = useState<Plan | null>(null);

  useEffect(() => {
    if (getPref(PREF, false)) return;
    let vivo = true;
    void Promise.all([db.getPlans(), db.getChosenPlan()]).then(([planos, escolhido]) => {
      if (!vivo || escolhido) return;
      const destaque = planos.find((p) => p.featured) ?? planos[1] ?? planos[0];
      if (!destaque) return;
      setTimeout(() => vivo && setPlano(destaque), 900);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!plano) return null;

  function fechar() {
    setPref(PREF, true);
    setPlano(null);
  }

  return (
    <ModalOverlay onClose={fechar}>
      <div
        className="modal-sheet glass-dark boas-vindas"
        role="dialog"
        aria-modal="true"
        aria-label="Seja membro da Tríade Conecta"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" aria-label="Fechar" onClick={fechar}>
          <Icon name="close" size={18} />
        </button>

        <span className="bv-marca">
          <Mark size={30} />
        </span>
        <p className="bv-olho">Mulheres · negócios · conexões</p>
        <h2 className="modal-title">Faça parte da Tríade</h2>
        <p className="bv-texto">
          Encontros presenciais mensais de 5h em Goiânia, com uma especialista convidada por edição.
          Como membra você tem:
        </p>

        <ul className="bv-lista">
          {plano.perks.map((p, i) => (
            <li key={p} style={{ animationDelay: `${0.06 * i + 0.1}s` }}>
              <Icon name="check" size={14} />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <p className="bv-preco">
          {plano.name} · <b>{formatPrice(plano.price)}</b>
          <small>{plano.period}</small>
        </p>

        <button
          className="btn btn-primary full"
          onClick={() => {
            fechar();
            navigate('/planos');
          }}
        >
          <Icon name="sparkle" size={15} /> Quero ser membro
        </button>
        <button type="button" className="bv-depois" onClick={fechar}>
          Agora não
        </button>
      </div>
    </ModalOverlay>
  );
}
