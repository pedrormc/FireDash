# Skill: Deploy Checklist (Vercel)

Checklist completo pré-deploy para produção na Vercel.

## Quando usar

Antes de fazer push para main ou quando solicitado via `/deploy`.

## Checklist

### 1. Build & Types
- [ ] `npm run lint` — sem erros de tipo (frontend)
- [ ] `npx tsc --noEmit -p api/tsconfig.json` — sem erros de tipo (backend)
- [ ] `npm run build` — build Vite compila sem erros

### 2. Testes (quando configurado)
- [ ] `npm run test -- --run` — testes passam
- [ ] Cobertura >= 80%

### 3. Qualidade de Código
- [ ] Sem `console.log` em arquivos commitados (usar `console.error` apenas para erros reais)
- [ ] Sem cores raw (hex/rgb) em componentes — usar tokens `fire-*`
- [ ] Sem credenciais ou secrets hardcoded no código
- [ ] Sem `any` em código novo
- [ ] Error handling com `unknown` + narrowing

### 4. Segurança (Pré-deploy)
- [ ] Queries SQL parametrizadas (sem string interpolation)
- [ ] Input validado em todas as rotas
- [ ] Sem `dangerouslySetInnerHTML`
- [ ] `.env.local` no `.gitignore`
- [ ] Rotas protegidas por auth middleware
- [ ] CORS com origem explícita (não `*`)

### 5. Configuração Vercel
- [ ] `vercel.json` rewrites corretos (frontend → SPA, api → serverless)
- [ ] Env vars configuradas: `DATABASE_URL`, `DB_SSL`, `JWT_SECRET`, `CORS_ORIGIN`
- [ ] `CORS_ORIGIN` = `https://firedash-bombeiros.vercel.app` (sem newline — usar `printf` no CLI)
- [ ] `DB_SSL` = `true` com `rejectUnauthorized: false`

### 6. Pós-deploy
- [ ] Health check: `GET https://firedash-bombeiros.vercel.app/api/health`
- [ ] Login funciona com cada role (admin, operador, visualizador)
- [ ] Dashboard carrega dados reais do PostgreSQL
- [ ] CRUD incidents funciona
- [ ] Mapa carrega corretamente

### 7. Rollback Plan
- [ ] Commit anterior identificado para revert se necessário
- [ ] Saber como reverter: `vercel rollback` ou `git revert`

## Output

Lista formatada com status para cada item. Se algum falhar, listar a correção necessária com prioridade.

## Agents de Suporte

- **build-error-resolver** — Se build falhar
- **security-reviewer** — Para audit de segurança profundo antes do deploy