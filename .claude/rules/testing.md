# Regras de Teste — Bombeiros

> Complementa as regras globais ECC em `~/.claude/rules/common/testing.md` e `~/.claude/rules/typescript/testing.md`.

## Validação Obrigatória (Antes de Qualquer Commit)

Rodar os 3 passos em sequência — se qualquer um falhar, corrigir antes de prosseguir:

```bash
# 1. Type-check frontend
npm run lint

# 2. Type-check backend
npx tsc --noEmit -p api/tsconfig.json

# 3. Build de produção
npm run build
```

## Console.log Audit

Verificar que nenhum `console.log` ficou no código:

```bash
git diff --name-only HEAD | xargs grep -l "console.log" 2>/dev/null
```

Remover qualquer `console.log` encontrado. Usar `console.error` apenas para erros reais.

## Testes Manuais da API

- Subir backend local: `npm run api:dev`
- Credenciais padrão: `admin@bombeiros.gov.br` / `admin123`
- Health check: `GET /api/health`
- Testar com curl os endpoints afetados pela mudança

## Checklist Pré-Deploy

1. [ ] `npm run lint` passa (frontend TypeScript)
2. [ ] `npx tsc --noEmit -p api/tsconfig.json` passa (backend TypeScript)
3. [ ] `npm run build` sucesso (Vite production build)
4. [ ] Sem `console.log` em arquivos commitados
5. [ ] `.env.local` não está no git
6. [ ] Sem secrets hardcoded no código
7. [ ] Login flow funciona (admin, operador, visualizador)
8. [ ] CRUD incidents funciona
9. [ ] Mapa carrega corretamente
10. [ ] Tokens `fire-*` usados (sem cores raw)

## Workflow TDD (Para Novas Features)

Seguir o ciclo RED → GREEN → IMPROVE:

1. **RED** — Escrever teste que falha descrevendo o comportamento esperado
2. **GREEN** — Implementar o mínimo necessário para o teste passar
3. **IMPROVE** — Refatorar mantendo testes verdes

Meta de cobertura: **80%+** (unit + integration).

## Testes Automatizados (Vitest + Testing Library)

### Configuração

- **Runner:** Vitest
- **Frontend:** React Testing Library
- **E2E:** Playwright (fluxos críticos)
- Arquivos de teste ao lado do source: `*.test.ts` / `*.test.tsx`
- Comando: `npm run test` (quando configurado)

### Prioridade de Testes

| Prioridade | O quê | Tipo |
|---|---|---|
| P0 | Auth (login/logout/roles) | Integration |
| P0 | CRUD incidents | Integration |
| P1 | Validação de input nas rotas | Unit |
| P1 | apiFetch (token injection, 401 redirect) | Unit |
| P1 | Componentes com lógica (filtros, forms) | Unit |
| P2 | KPIs e Dashboard | Integration |
| P2 | Mapa e Relatórios | E2E |
| P3 | Componentes de UI pura | Snapshot |

### Backend (API)

- Testar cada rota com auth válida e inválida
- Testar com input válido e inválido
- Verificar HTTP status codes corretos
- Verificar formato de resposta (`{ success, data/error }`)

### Frontend

- Focar em **interações do usuário**, não detalhes de implementação
- Testar fluxos: login → dashboard → CRUD → logout
- Verificar que roles restringem acesso corretamente
- Mock do `apiFetch` para testes unitários, API real para integration

### E2E (Playwright)

Fluxos críticos a cobrir:
- Login com cada role e verificar acesso
- Criar, editar e deletar ocorrência
- Navegação entre páginas
- Admin: CRUD de usuários

## Agents de Suporte

- **tdd-guide** — Usar PROATIVAMENTE para novas features
- **e2e-runner** — Para testes Playwright de fluxos críticos
- **build-error-resolver** — Quando build falhar
