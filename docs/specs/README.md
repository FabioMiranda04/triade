# `docs/specs/` — desenvolvimento guiado por especificação (SDD)

> **A regra:** comportamento novo ou alterado começa aqui, não no editor de
> código. Primeiro a spec diz *o que* tem de acontecer e *como se prova que
> aconteceu*; só depois o código diz *como*.

## Por que existe

O modo antigo de trabalhar deste projeto era: o usuário descreve, o Claude
implementa, e a decisão fica registrada em três lugares diferentes —
comentário no componente, entrada no CHANGELOG, e a conversa (que morre).
Duas consequências reais já aconteceram aqui:

1. **a regra viveu só no comentário.** A cadência do convite de membro
   ("uma vez por aparelho") estava escrita dentro de `BoasVindas.tsx`. Para
   mudá-la foi preciso ler o componente inteiro para descobrir onde a
   decisão morava;
2. **mudar a regra significava reescrever a tela.** Regra e apresentação
   estavam no mesmo arquivo, no mesmo `useEffect`.

A spec resolve os dois: a regra tem um endereço fixo, e o código dela é uma
**função pura** com nome — mexer na regra é mexer numa função, não na tela.

## Formato de uma spec

Arquivo `SPEC-NNN-nome-curto.md`, com estas seções, nesta ordem:

| Seção | O que responde |
|---|---|
| **Status** | rascunho · aprovada · implementada · substituída por SPEC-NNN |
| **Problema** | o que está errado hoje, em uma frase observável |
| **Decisão** | a regra, numerada (`D1`, `D2`…). Cada `D` é testável sozinha |
| **Contrato** | as assinaturas das funções: entrada, saída, arquivo |
| **Aceite** | a lista do que precisa ser verdade para fechar. Cada item é uma verificação, não uma opinião |
| **Fora de escopo** | o que foi considerado e deixado de fora, com o motivo |

A seção **Contrato** é a que paga o investimento: ela nomeia a função onde
a regra mora. Sessão futura que precise mudar o comportamento lê a spec,
abre uma função, muda, e o resto do app não sabe que algo mudou.

## Como o código responde à spec

Regra de decisão → **função pura, sem `await`, sem `localStorage`, sem
React**. Entra estado, sai decisão. Quem busca dado e quem desenha tela
ficam de fora dela.

```
componente  →  lê o estado (db, prefs)  →  chama a função pura  →  desenha
```

Isso não é arquitetura nova: é a mesma fronteira da regra 5 do `CLAUDE.md`
(nenhum componente fala com `localStorage`/Supabase direto), aplicada agora
também à **decisão**, não só ao **dado**.

## Índice

| Spec | Assunto | Status |
|---|---|---|
| [SPEC-001](./SPEC-001-convite-de-membro.md) | Quando o convite de membro aparece | implementada — 04/09/2026 |
| [SPEC-002](./SPEC-002-pagamento.md) | Assinatura e pagamento (Módulo 4) | aprovada, não implementada |
