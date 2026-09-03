import { Skeleton } from '@/components/Skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { db } from '@/lib/db';
import { byName } from '@/lib/format';
import type { Member } from '@/types';

/**
 * Diretório de membras — a primeira peça do Módulo 3.
 *
 * Só aparece para quem está logada, e isso não é decisão de tela: a RLS de
 * `profiles` devolve linha apenas para `authenticated`. Deslogada, o banco
 * recusa — a tela só evita mostrar um vazio sem explicação.
 *
 * Quem ainda não preencheu o perfil aparece assim mesmo, com o rótulo
 * genérico: sumir com a pessoa da lista da própria comunidade é pior do que
 * mostrar um cartão incompleto, e o cartão incompleto convida a preencher.
 */
export function DiretorioMembras() {
  const { data: membras, loading } = useAsyncData<Member[]>(() => db.getMembers(), []);
  const ordenadas = [...membras].sort((a, b) => byName({ name: a.nome }, { name: b.nome }));

  if (loading) return <Skeleton rows={2} height={78} />;

  if (ordenadas.length === 0) {
    return (
      <p className="empty-state">
        Ainda não há membras cadastradas — quando as primeiras entrarem, elas aparecem aqui.
      </p>
    );
  }

  return (
    <ul className="membras">
      {ordenadas.map((m) => (
        <li className="membra glass" key={m.id}>
          <span className="ava">
            {m.avatarUrl ? (
              <img
                className="foto-fade"
                src={m.avatarUrl}
                alt=""
                loading="lazy"
                onLoad={(e) => e.currentTarget.classList.add('carregou')}
              />
            ) : (
              m.nome.slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="txt">
            <span className="nm">{m.nome}</span>
            {m.negocio && <span className="ng">{m.negocio}</span>}
            {m.bio && <span className="bio">{m.bio}</span>}
          </span>
          {/* O @ é o próprio link — não existe glifo do Instagram no
              `Icon.tsx`, e criar um só para isto seria trocar uma palavra
              legível por um símbolo (regra 7). */}
          {m.instagram && (
            <a
              className="ig"
              href={`https://instagram.com/${m.instagram.replace(/^@/, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              @{m.instagram.replace(/^@/, '')}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
