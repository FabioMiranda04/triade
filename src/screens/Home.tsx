import { useMemo, useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { SectionHead } from '@/components/SectionHead';
import { EventModal } from '@/components/EventModal';
import { PostEditSheet } from '@/components/PostEditSheet';
import { Mark } from '@/components/Brand';
import { posts } from '@/data/seed';
import { useAsyncData } from '@/hooks/useAsyncData';
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
  const [featured, ...rest] = useMemo(() => {
    const proximo = [...events]
      .filter((e) => e.status === 'em breve')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const i = proximo ? todosPosts.findIndex((p) => p.eventId === proximo.id) : -1;
    if (i <= 0) return todosPosts;
    return [todosPosts[i], ...todosPosts.filter((_, k) => k !== i)];
  }, [events, todosPosts]);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const openEvent = events.find((e) => e.id === openEventId) ?? null;

  function handlePostSaved() {
    setEditingPost(false);
    forceUpdate((v) => v + 1);
    showToast('Post salvo neste aparelho ✓');
  }

  return (
    <section className="panel">
      <PostCard
        post={featured}
        onOpenEvent={setOpenEventId}
        onEdit={() => setEditingPost(true)}
        destaqueNovo={anunciar}
        chamariz={!!featured.eventId}
      />
      {openEvent && <EventModal event={openEvent} onClose={() => setOpenEventId(null)} />}
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

      {rest.map((post) => (
        <PostCard key={post.id} post={post} onOpenEvent={setOpenEventId} />
      ))}
    </section>
  );
}
