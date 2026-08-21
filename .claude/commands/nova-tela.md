Crie uma nova tela no app seguindo as convenções do projeto.

Tela pedida: $ARGUMENTS

Passos obrigatórios, nesta ordem:

1. Leia o `CLAUDE.md` e o `docs/DESIGN-SYSTEM.md` antes de escrever código.
2. Crie `src/screens/<Nome>.tsx` com `export default`, envolvendo o conteúdo
   numa `<section className="panel">`.
3. Use os componentes existentes (`SectionHead`, `PostCard`, `Icon`, `Mark`)
   antes de criar novos. Só crie componente novo se for reutilizável.
4. Registre a `<Route>` em `src/App.tsx`.
5. Se a tela for uma aba, adicione o item em `src/components/TabBar.tsx`.
   Atenção: mais de 5 abas aperta demais em telas de 360px — confirme comigo
   antes de passar disso.
6. Conteúdo de texto vai para `src/data/seed.ts`, não hardcoded no JSX.
7. Estilos novos vão para `src/styles/components.css`, usando as variáveis de
   `tokens.css`. Nenhum hex solto.
8. Rode `npm run build` e só me diga que terminou depois que passar.
9. Descreva em uma frase o que verificar em 375px de largura.
