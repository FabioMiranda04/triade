import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';
import { ModalOverlay } from '@/components/ModalOverlay';
import { db } from '@/lib/db';
import { decidirConvite } from '@/lib/convite';
import { getFlagSessao, setFlagSessao } from '@/lib/db/prefs';
import { formatPrice } from '@/lib/format';
import type { Plan } from '@/types';

const FLAG = 'convite_visto_sessao';

/** D5 — tempo para a tela terminar de montar antes de o convite entrar. */
const ATRASO_MS = 900;

/**
 * Convite para virar membra.
 *
 * **Quando ele aparece não se decide aqui** — a regra inteira mora em
 * `src/lib/convite.ts`, especificada em
 * `docs/specs/SPEC-001-convite-de-membro.md`. Este componente faz três
 * coisas e só: busca o estado, pergunta à regra, desenha o resultado.
 *
 * Em resumo, para quem está lendo a tela: o convite volta **a cada abertura
 * do app** (não a cada navegação, não a cada F5) e some para sempre quando
 * a pessoa assina um plano pago.
 *
 * Os benefícios não são texto fixo: saem do plano promovido, então corrigir
 * uma vantagem em Planos → "..." → Editar já corrige o convite. Duas fontes
 * de verdade para a mesma lista sairiam de sincronia na primeira alteração.
 */
export function BoasVindas() {
  const navigate = useNavigate();
  const [plano, setPlano] = useState<Plan | null>(null);

  useEffect(() => {
    let vivo = true;
    void Promise.all([db.getPlans(), db.getChosenPlan()]).then(([planos, escolhido]) => {
      if (!vivo) return;
      const promovido = decidirConvite({
        planos,
        planoEscolhidoId: escolhido,
        vistoNestaAbertura: getFlagSessao(FLAG),
      });
      if (!promovido) return;
      // D6: marca aqui, na decisão, e não no fechar — senão quem ignora o
      // pop-up e recarrega a página o vê de novo na mesma abertura.
      setFlagSessao(FLAG);
      setTimeout(() => vivo && setPlano(promovido), ATRASO_MS);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!plano) return null;

  function fechar() {
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
