# CLAUDE.md — Bombeiros

Sistema de monitoramento e gestão de ocorrências para corpo de bombeiros.

## Comandos

```bash
# Frontend
npm run dev      # Dev server em http://localhost:3000
npm run build    # Build de produção
npm run lint     # Type-check (tsc --noEmit)
npm run preview  # Preview do build

# Backend (API)
npm run api:dev   # API com hot reload em http://localhost:3001
npm run api:start # API sem hot reload
```

## Ambiente

Copiar `.env.example` para `.env.local` e definir:
- `GEMINI_API_KEY` — chave da API Gemini
- `DATABASE_URL` — conexão PostgreSQL (VPS)
- `JWT_SECRET` — chave para tokens JWT
- `CORS_ORIGIN` — origem permitida para CORS

## Referências Rápidas

| O quê | Onde |
|---|---|
| PRD e progresso | `PRD.md` |
| Próximos passos | `NEXT_STEPS.md` |
| Regras de código | `.claude/rules/coding.md` |
| Regras de teste | `.claude/rules/testing.md` |
| Skill: review | `.claude/skills/review/SKILL.md` |
| Skill: refactor | `.claude/skills/refactor/SKILL.md` |
| Arquitetura completa | `docs/architecture.md` |
| Decisões (ADRs) | `docs/decisions/` |
| Output styles | `.claude/output-styles/` |
| SQL de seed | `api/seed.sql` |

## Arquitetura (resumo)

- **Frontend:** SPA React 19 + TypeScript + Vite (sem router library)
- **Backend:** Node.js + Express (API REST), deploy na Vercel
- **Banco:** PostgreSQL (VPS própria)
- **Auth:** JWT + login/senha simples, 3 roles (admin, operador, visualizador)
- Navegação via estado `Page` em `App.tsx`
- Tailwind CSS v4 — usar tokens `fire-*` (nunca cores raw)
- Dados em migração de mock (`src/data/mockData.ts`) para banco real

## Estrutura

```
src/                    # Frontend (React SPA)
├── components/         # Componentes compartilhados (Sidebar, Topbar, KpiCards, etc.)
├── pages/              # Páginas (RelatoriosPage, MapaPage, ConfiguracoesPage)
├── data/               # Mock data e tipos (será substituído por services/)
├── App.tsx             # Dashboard + navegação

api/                    # Backend (Express API)
├── index.ts            # Entry point — Express app + rotas
├── db.ts               # Pool de conexão PostgreSQL
├── seed.sql            # SQL de criação de tabelas + dados iniciais
├── middleware/
│   ├── auth.ts         # Middleware JWT (gera e valida tokens)
│   └── roles.ts        # Middleware de roles (admin, operador, visualizador)
├── routes/
│   ├── auth.ts         # POST /login, GET /me, POST /logout
│   ├── incidents.ts    # CRUD ocorrências + filtros
│   ├── kpis.ts         # GET/PUT KPIs
│   ├── tipos.ts        # CRUD tipos de ocorrência
│   └── users.ts        # CRUD usuários (admin only)

.claude/                # Contexto para IA
├── rules/              # Regras operacionais
├── skills/             # Workflows reutilizáveis
├── output-styles/      # Estilos de resposta

docs/                   # Documentação do projeto
├── architecture.md
├── decisions/          # ADRs
├── runbooks/           # Processos operacionais
```

## Banco de Dados

4 tabelas: `users`, `incidents`, `kpis`, `tipos_ocorrencia`. Schema completo em `api/seed.sql` e documentado no `PRD.md`.

## Roles e Acesso

| Role | Acesso |
|---|---|
| `admin` | Tudo + painel admin (CRUD usuários) |
| `operador` | Dashboard, Relatórios, Mapa, Config, CRUD ocorrências |
| `visualizador` | Somente Dashboard (read-only) |
