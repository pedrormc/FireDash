# Regras de Código — Bombeiros

> Complementa as regras globais ECC em `~/.claude/rules/common/` e `~/.claude/rules/typescript/`.
> Regras aqui são **específicas do projeto Bombeiros** — não duplicar o que já está no ECC.

## Stack

- **Frontend:** React 19 + TypeScript + Vite 6 (SPA)
- **Backend:** Node.js + Express + TypeScript (API REST)
- **Banco:** PostgreSQL (VPS) — pool em `api/db.ts`
- **Auth:** JWT + 3 roles (admin, operador, visualizador)
- **Deploy:** Vercel (frontend SPA + serverless functions)

## Estilização

- Tailwind CSS v4 exclusivamente — nunca CSS inline ou styled-components
- Usar tokens customizados do tema: `fire-dark`, `fire-card`, `fire-red`, `fire-orange`, `fire-green`, `fire-sidebar`, `fire-muted`
- Exemplo: `bg-fire-card`, `text-fire-red`, `border-fire-muted`
- **Nunca usar cores raw** (hex, rgb) — sempre tokens `fire-*`

## Estrutura de Componentes (Frontend)

- Um componente por arquivo (componentes funcionais com hooks — nunca class components)
- Nome do arquivo = nome do componente (PascalCase)
- Componentes compartilhados em `src/components/`
- Páginas em `src/pages/`
- Dados e tipos em `src/data/`
- Services (chamadas API) em `src/services/`
- Contexts (estado global) em `src/contexts/`
- Hooks customizados em `src/hooks/` (quando criados)

## Estrutura da API (Backend)

- Entry point: `api/index.ts`
- Rotas em `api/routes/` — um arquivo por recurso
- Middlewares em `api/middleware/`
- Conexão DB em `api/db.ts`
- Todas as rotas protegidas por JWT (exceto login e health)
- Roles controladas via middleware `requireRole()`

## Navegação

- Sem router library — navegação via estado `Page` em `App.tsx`
- Novas páginas devem ser adicionadas ao union type `Page`
- Props de navegação: `onNavigate`, `currentPage`

## TypeScript (específico do projeto)

- Strict mode habilitado
- `interface` para props de componentes e shapes de objetos
- `type` para unions (`Page`, `Role`, `Status`), intersections e utility types
- Evitar `any` — usar `unknown` para dados externos, depois narrowing
- Export nomeado (não default) quando possível
- Tipos de domínio em `src/data/` — não espalhar interfaces inline

## Imports

- Ordem: React → libs externas → componentes → services → data/utils → tipos
- Usar `@/` alias ao invés de caminhos relativos longos

## Imutabilidade (CRÍTICO)

Nunca mutar estado — sempre criar novos objetos:

```typescript
// ERRADO: mutação
incidents.push(newIncident)
user.role = 'admin'

// CORRETO: imutável
const updated = [...incidents, newIncident]
const updatedUser = { ...user, role: 'admin' as const }
```

## Padrão de Resposta da API

Todas as respostas da API devem seguir envelope consistente:

```typescript
// Sucesso
{ success: true, data: T }
{ success: true, data: T[], meta: { total, page, limit } }

// Erro
{ success: false, error: "mensagem em PT-BR" }
```

## Validação de Input (Backend)

- Validar **todos** os inputs do usuário nas rotas da API antes de processar
- Campos obrigatórios: verificar presença e tipo
- Strings: trim e verificar comprimento
- IDs: verificar formato numérico
- Datas: verificar formato válido
- Retornar 400 com mensagem clara em PT-BR para input inválido

## Autenticação

- JWT armazenado em `localStorage`
- Enviado via header `Authorization: Bearer <token>`
- 3 roles: `admin`, `operador`, `visualizador`
- Rotas da API validam role via middleware antes de executar
- Frontend usa `AuthContext` (`src/contexts/AuthContext.tsx`) para estado global de auth
- `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) controla acesso por role
- `apiFetch` (`src/services/api.ts`) injeta token e redireciona em 401

## Dados

- Dados reais vêm da API REST via services (`src/services/`)
- `AuthenticatedApp` carrega incidents e KPIs no mount e passa via props
- Alerts são derivados dos últimos 3 incidents "Em Andamento" (sem tabela própria)
- Filtros no Dashboard são aplicados client-side sobre dados já carregados

## Error Handling

- **Frontend:** try/catch com mensagens amigáveis em PT-BR para o usuário via toast/alert
- **Backend:** try/catch em cada handler de rota, retornar `{ success: false, error: "mensagem" }` com HTTP status correto
- Nunca silenciar erros — sempre logar com `console.error`
- Tipar errors como `unknown` e fazer narrowing:

```typescript
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido'
  console.error('Operação falhou:', error)
  res.status(500).json({ success: false, error: message })
}
```

## Service Layer

- Todas as chamadas API passam por `apiFetch()` de `src/services/api.ts` — nunca `fetch` direto
- Um arquivo por recurso em `src/services/`: `incidents.ts`, `kpis.ts`, `users.ts`
- `apiFetch` injeta token JWT e redireciona para login em 401

## State Management

- Estado global de auth: `AuthContext` (`src/contexts/AuthContext.tsx`)
- Dados de página (incidents, KPIs): carregados em `AuthenticatedApp` e passados via props
- Estado local de UI (filtros, modais, forms): `useState` no componente que gerencia
- Para estado compartilhado complexo: considerar Context adicional antes de prop drilling profundo

## SQL (Backend)

- Sempre usar queries parametrizadas (`$1, $2...`) — nunca concatenar strings
- Especificar colunas no SELECT — evitar `SELECT *`
- Usar transações para operações multi-tabela
- Incluir `ORDER BY` explícito em listagens
