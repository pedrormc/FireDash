# Skill: Verification Loop

Loop de verificação obrigatório após qualquer mudança de código. Use o agent **build-error-resolver** quando builds falharem.

## Quando usar

Após implementar qualquer feature, fix ou refactor. Invocar via `/verify`.

## Passos

### 1. TypeScript Check (Frontend + Backend)
```bash
npm run lint                              # Frontend (tsc --noEmit)
npx tsc --noEmit -p api/tsconfig.json     # Backend
```
Se falhar: corrigir erros de tipo e repetir. Se persistir, usar agent **build-error-resolver**.

### 2. Build Check
```bash
npm run build
```
Se falhar: corrigir imports quebrados, exports faltando, ou erros Vite.

### 3. Test Check (quando configurado)
```bash
npm run test -- --run                     # Vitest (sem watch mode)
```
Se falhar: corrigir testes quebrados. Usar agent **tdd-guide** se necessário.

### 4. Console.log Audit
```bash
git diff --name-only HEAD | xargs grep -l "console.log" 2>/dev/null
```
Remover qualquer `console.log` encontrado.

### 5. Security Quick Check
- [ ] Sem secrets hardcoded nos arquivos alterados
- [ ] Queries SQL parametrizadas (sem string interpolation)
- [ ] Input do usuário validado antes de processar
- [ ] Sem `dangerouslySetInnerHTML`

### 6. Smoke Test Manual
Descrever o que testar no browser/API baseado nas mudanças feitas:
- Se mudou auth → testar login/logout com cada role
- Se mudou incidents → testar CRUD completo
- Se mudou UI → verificar responsividade e tokens fire-*
- Se mudou API → testar com curl os endpoints afetados
- Se mudou DB → verificar consistência com `/db-check`

## Regra

Nunca considerar uma tarefa concluída até que todos os passos passem. Se qualquer passo falhar, corrigir e reiniciar do passo 1.

## Agents de Suporte

- **build-error-resolver** — Para erros de build/type persistentes
- **tdd-guide** — Para testes falhando
- **security-reviewer** — Para review de segurança profundo
- **code-reviewer** — Para review de qualidade após verificação