Feche a sessão de trabalho atualizando a documentação do projeto.

1. Rode `git log` e `git diff` para levantar o que mudou de fato nesta
   sessão. Não invente itens.
2. Adicione uma entrada **no topo** do `docs/CHANGELOG.md`, subindo a versão
   MINOR (ou MAJOR se o módulo mudou), com data de hoje, no mesmo formato das
   entradas existentes, terminando com a linha de arquivos alterados.
3. Atualize o `docs/ESTADO-DO-PROJETO.md`: cabeçalho (versão, data, módulo) e
   as seções 2 (Status atual), 4 (Arquivos), 5 (O que NÃO foi feito) e 6/7
   (Roadmap/Prioridades). Esse arquivo precisa fazer sentido lido sozinho.
4. Se alguma regra ou convenção mudou, reflita no `CLAUDE.md`.
5. Rode `npm run build` para garantir que o repositório está saudável.
6. Me mostre um resumo do que você escreveu antes de commitar.
