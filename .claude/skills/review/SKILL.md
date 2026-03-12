# Skill: Code Review

Revise o código alterado seguindo checklist completo. Use o agent **code-reviewer** para análises profundas.

## Checklist

### 1. Tokens e Estilização
- [ ] Todas as cores usam tokens `fire-*`? Nenhuma cor raw (hex/rgb)?
- [ ] Tailwind CSS v4 — sem CSS inline ou styled-components?

### 2. TypeScript
- [ ] Tipos explícitos em APIs públicas? Sem `any`?
- [ ] `interface` para props e shapes, `type` para unions?
- [ ] Errors tipados como `unknown` com narrowing?

### 3. Imutabilidade
- [ ] Sem mutação de estado (`.push()`, atribuição direta)?
- [ ] Spread operator para updates?

### 4. Componentes
- [ ] Um por arquivo? Nome PascalCase? Props com interface nomeada?
- [ ] Sem `React.FC` desnecessário?

### 5. Navegação
- [ ] Mudanças consistentes com union type `Page` em `App.tsx`?

### 6. API / Backend
- [ ] Queries parametrizadas (`$1, $2...`)? Sem string interpolation em SQL?
- [ ] Respostas seguem formato `{ success, data/error }`?
- [ ] Input validado antes de processar?
- [ ] SELECT com colunas específicas (sem `SELECT *`)?

### 7. Segurança
- [ ] Sem XSS (`dangerouslySetInnerHTML`)?
- [ ] Sem secrets hardcoded?
- [ ] Rotas protegidas por auth + role?
- [ ] CORS com origem explícita?

### 8. Performance
- [ ] Sem rerenders desnecessários?
- [ ] Listas com `key` única?
- [ ] Effects com cleanup?
- [ ] Sem chamadas API em loops

### 9. Error Handling
- [ ] try/catch em operações async?
- [ ] Mensagens amigáveis em PT-BR no frontend?
- [ ] Erros logados com `console.error`?

### 10. Qualidade (ECC)
- [ ] Funções < 50 linhas?
- [ ] Arquivo < 800 linhas?
- [ ] Nesting < 4 níveis?
- [ ] Sem `console.log` em código commitado?

## Output

- Lista com severidade: **CRITICAL** / **HIGH** / **MEDIUM** / **LOW**
- Para cada item: descrição, arquivo:linha, correção sugerida
- Resultado: APPROVED / CHANGES REQUESTED
