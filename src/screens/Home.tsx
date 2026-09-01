import { useMemo, useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { SectionHead } from '@/components/SectionHead';
import { EventModal } from '@/components/EventModal';
import { PostEditSheet } from '@/components/PostEditSheet';
import { Mark } from '@/components/Brand';
import { posts } from '@/data/seed';
import { useAsyncData } from '@/hooks/useAsyncData';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import { db } from '@/lib/db';
import { applyEventEdits, applyPostEdits } from '@/lib/db/localContent';
import { useToast } from '@/components/Toast';
import type { TriadeEvent } from '@/types';

const PILLARS = ['Conexão', 'Inspiração', 'Ação'];

/**
 * A animação de "chegou coisa nova" no post em destaque roda UMA vez por
 * abertura do app, não a cada vez que a usuária volta para o Início. Trocar
 * de aba desmonta e remonta esta tela; um estado do componente reiniciaria
 * junto e a animação tocaria de novo a cada visita — o que deixa de
 * anunciar novidade e vira tique.
 *
 * Módulo, e não `sessionStorage`: o que se quer é "esta carga da página",
 * que é exatamente o tempo de vida do módulo. E storage passa pelo `db`
 * (regra 5), o que seria peso demais para uma animação.
 */
let jaAnunciouDestaque = false;

/** Tela Início — stories + feed da comunidade. */
export default function Home() {
  const { showToast } = useToast();
  const [anunciar] = useState(() => {
    if (jaAnunciouDestaque) return false;
    jaAnunciouDestaque = true;
    return true;
  });
  const [, forceUpdate] = useState(0);
  const todosPosts = applyPostEdits(posts);
  const { data: events } = useAsyncData<TriadeEvent[]>(() => db.getEvents().then(applyEventEdits), []);

  // O chamariz da primeira tela é o post do evento MAIS PRÓXIMO, escolhido
  // aqui e não fixado no `seed.ts`. A diferença aparece quando entra um
  // evento novo: antes, o destaque continuava no evento antigo até alguém
  // lembrar de reordenar o array à mão — foi exatamente assim que a tela
  // ficou anunciando o Jantar de 30/09 com a Feira de 11/09 já marcada.
  // Sem evento por vir (ou sem post correspondente), cai no primeiro post.
  //
  // O Início mostra o que ainda vai acontecer, em ordem de data — nada de
  // feed com post antigo disputando a primeira dobra. Quando há mais de uma
  // edição marcada (setembro tem duas: a Feira dia 11 e o Jantar dia 30),
  // as duas aparecem; a mais próxima é a que ganha moldura e selo.
  //
  // Sem nenhum evento por vir, cai no primeiro post do `seed.ts` para a tela
  // não abrir vazia.
  const emCartaz = useMemo(() => {
    const porVir = events
      .filter((e) => e.status === 'em breve')
      .sort((a, b) => a.date.localeCompare(b.date));
    const posts = porVir
      .map((e) => todosPosts.find((p) => p.eventId === e.id))
      .filter((p): p is NonNullable<typeof p> => !!p);
    return posts.length > 0 ? posts : todosPosts.slice(0, 1);
  }, [events, todosPosts]);
  const featured = emCartaz[0];
  const podeEditar = usePodeEditar();
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [passoEvento, setPassoEvento] = useState<'details' | 'contact'>('details');
  const openEvent = events.find((e) => e.id === openEventId) ?? null;

  function abrirEvento(eventId: string, passo: 'details' | 'contact' = 'details') {
    setPassoEvento(passo);
    setOpenEventId(eventId);
  }

  function handlePostSaved() {
    setEditingPost(false);
    forceUpdate((v) => v + 1);
    showToast('Post salvo neste aparelho ✓');
  }

  return (
    <section className="panel">
      {emCartaz.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          onOpenEvent={abrirEvento}
          onEdit={podeEditar && i === 0 ? () => setEditingPost(true) : undefined}
          destaqueNovo={anunciar && i === 0}
          chamariz={i === 0 && !!post.eventId}
          vendendo={!!post.eventId}
        />
      ))}
      {openEvent && (
        <EventModal
          event={openEvent}
          passoInicial={passoEvento}
          onClose={() => setOpenEventId(null)}
        />
      )}
      {editingPost && (
        <PostEditSheet
          post={featured}
          events={events}
          onClose={() => setEditingPost(false)}
          onSaved={handlePostSaved}
        />
      )}

      <SectionHead eyebrow="Nosso propósito" title="Três pilares, um só movimento" />
      <article className="post glass pillars">
        {PILLARS.map((pillar) => (
          <div className="pillar" key={pillar}>
            <Mark size={24} />
            <div className="lbl">{pillar}</div>
          </div>
        ))}
      </article>

      <article className="post glass-dark quote-card">
        <div className="q">
          “Conexões verdadeiras não nascem do interesse, mas da presença, da escuta e de um
          propósito em comum.”
        </div>
        <div className="script handle">@triade.conecta</div>
      </article>
    </section>
  );
}
