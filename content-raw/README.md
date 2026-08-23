# content-raw/

Material bruto pra virar conteúdo real do app (fotos, vídeos, legendas) —
**nunca é commitado** (ver `.gitignore`), é só uma pasta de trabalho local.
Plano completo de como isso vira mídia de verdade no app (Supabase
Storage etc.): `docs/ESTADO-DO-PROJETO.md`, Módulo 11.

## `instagram-export/`

Extraia aqui o(s) `.zip` baixado(s) do Instagram (Configurações → Central
de Privacidade → Baixar suas informações — ver `docs/ESTADO-DO-PROJETO.md`
seção 7, item 1, pra como pedir esse export). Pode jogar a estrutura exata
que o Instagram gera, sem reorganizar nada:

```
content-raw/instagram-export/
└── your_instagram_activity/
    ├── media/
    │   ├── posts/
    │   └── stories/
    └── content/
        ├── posts_1.json
        └── stories.json
```

Quando estiver aqui, é só avisar numa conversa com o Claude Code que o
material chegou.
