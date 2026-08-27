import { Mark } from '@/components/Brand';
import { SectionHead } from '@/components/SectionHead';
import { founders, timeline } from '@/data/seed';

const STATS = [
  { num: '3', lbl: 'idealizadoras' },
  { num: '11+', lbl: 'edições' },
  { num: 'set/26', lbl: 'próxima edição' },
];

/** Tela Sobre — perfil da comunidade, idealizadoras e trajetória. */
export default function Sobre() {
  return (
    <section className="panel">
      <div className="profile-card glass">
        <div className="sheen" />
        <div className="profile-top">
          <div className="profile-avatar">
            <Mark size={34} />
          </div>
          <div>
            <h1 style={{ fontSize: 19 }}>Tríade Conecta</h1>
            <div style={{ fontSize: 12.5, color: 'var(--ink-70)', marginTop: 2 }}>
              @triade.conecta
            </div>
          </div>
        </div>
        <p className="profile-bio">
          Um encontro para mulheres que desejam ir além do <b>networking superficial</b>: conexão,
          inspiração e ação.
        </p>
        <div className="profile-stats">
          {STATS.map((s) => (
            <div key={s.lbl}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionHead eyebrow="Idealizadoras" title="Quem está por trás" />
      <div className="founder-row">
        {founders.map((f) => (
          <div className="founder-chip glass" key={f.id}>
            <div className="av">{f.initials}</div>
            <div className="n">{f.name}</div>
            <div className="r">{f.role}</div>
            <p>{f.blurb}</p>
          </div>
        ))}
      </div>

      <SectionHead eyebrow="Nossa trajetória" title="Conexões genuínas" />
      {timeline.map((item) => (
        <article className="post glass soft-card" key={item.id}>
          <div className="eyebrow">{item.label}</div>
          <p>{item.text}</p>
        </article>
      ))}
    </section>
  );
}
