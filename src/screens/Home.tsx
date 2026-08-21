import { Stories } from '@/components/Stories';
import { PostCard } from '@/components/PostCard';
import { SectionHead } from '@/components/SectionHead';
import { Mark } from '@/components/Brand';
import { posts } from '@/data/seed';

const PILLARS = ['Conexão', 'Inspiração', 'Ação'];

/** Tela Início — stories + feed da comunidade. */
export default function Home() {
  const [featured, ...rest] = posts;

  return (
    <section className="panel">
      <Stories />

      <PostCard post={featured} />

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
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
