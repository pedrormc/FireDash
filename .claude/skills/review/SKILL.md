# Skill: Code Review

Revise o código alterado verificando:

1. **Tokens de tema** — Todas as cores usam tokens `fire-*`? Nenhuma cor raw?
2. **TypeScript** — Tipos explícitos? Sem `any`? Interfaces para props?
3. **Componentes** — Um por arquivo? Nome PascalCase? Props bem definidas?
4. **Navegação** — Mudanças no fluxo de navegação são consistentes com `Page` union type?
5. **Segurança** — Sem XSS, injection, ou dados sensíveis expostos?
6. **Performance** — Rerenders desnecessários? Listas sem key? Efeitos sem cleanup?

## Output
- Lista de problemas encontrados com severidade (crítico/médio/baixo)
- Sugestões de melhoria
- Aprovação ou solicitação de correções
