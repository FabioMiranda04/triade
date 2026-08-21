Revise as alterações recentes com olhar de app mobile.

Verifique e me relate, com o arquivo e a linha de cada problema:

1. **Alvo de toque**: todo elemento clicável tem pelo menos ~38px de altura?
2. **375px**: algum texto, botão ou card estoura a largura de um iPhone SE?
3. **Scroll**: o `body` continua sem rolar? Só a `.app-main` rola?
4. **Safe area**: a tab bar mantém `calc(6px + var(--safe-b))` no padding?
5. **Tokens**: apareceu algum hex, rgb ou fonte escrita direto no componente
   em vez de variável CSS?
6. **Acessibilidade**: botões só de ícone têm `aria-label`? Botões de estado
   têm `aria-pressed`?
7. **Movimento**: alguma animação nova ignora `prefers-reduced-motion`?
8. **Persistência**: algum componente passou a chamar `localStorage` direto
   em vez de usar `TriadeData`?

Não altere nada sem me perguntar — este comando é só diagnóstico.
