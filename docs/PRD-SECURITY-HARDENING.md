# PRD — Security Hardening da API Backend

**Projeto:** FireDash (Bombeiros)
**Data:** 2026-03-12
**Versao:** 1.0
**Escopo:** Exclusivamente `api/` + ajustes no frontend para compatibilidade auth
**Producao:** https://firedash-bombeiros.vercel.app

---

## 1. Contexto e Problema

Auditoria de seguranca realizada em 2026-03-12 identificou **23 vulnerabilidades** no backend da API REST (Express + PostgreSQL). O sistema esta em producao com dados reais de ocorrencias de bombeiros. As vulnerabilidades incluem senhas em texto plano, endpoint de registro publico com role injection, fallback hardcoded do JWT secret, e ausencia total de rate limiting, security headers e CSRF protection.

### Estado Atual da API

| Arquivo | Linhas | Funcao |
|---------|--------|--------|
| `api/index.ts` | 44 | Express app, CORS, rotas |
| `api/db.ts` | 17 | Pool PostgreSQL |
| `api/middleware/auth.ts` | 38 | JWT auth middleware + generateToken |
| `api/middleware/roles.ts` | 21 | Role-based access control |
| `api/routes/auth.ts` | 128 | Login, register, /me, logout |
| `api/routes/incidents.ts` | 175 | CRUD ocorrencias + filtros |
| `api/routes/kpis.ts` | 55 | GET/PUT KPIs |
| `api/routes/tipos.ts` | 75 | CRUD tipos de ocorrencia |
| `api/routes/users.ts` | 144 | CRUD usuarios (admin) |
| `api/seed.sql` | 106 | Schema + dados iniciais |

### Dependencias Atuais (relevantes)

- `express` 4.21.2
- `cors` 2.8.6
- `jsonwebtoken` 9.0.3
- `pg` 8.20.0
- `dotenv` 17.2.3

### Novas Dependencias Necessarias

| Pacote | Proposito | Fase |
|--------|-----------|------|
| `bcrypt` | Hashing de senhas | F1 |
| `@types/bcrypt` | Tipos TypeScript | F1 |
| `express-rate-limit` | Rate limiting | F2 |
| `helmet` | Security headers | F2 |

---

## 2. Inventario de Vulnerabilidades

### 2.1 CRITICAL (6)

| ID | Vulnerabilidade | Arquivo(s) | Linha(s) |
|----|----------------|------------|----------|
| CRIT-01 | Senhas armazenadas e comparadas em texto plano | `routes/auth.ts`, `routes/users.ts`, `seed.sql` | auth:18, users:50,84,90, seed:57 |
| CRIT-02 | Fallback hardcoded `'bombeiros-secret-dev'` no JWT_SECRET | `middleware/auth.ts` | 4 |
| CRIT-03 | `/register` publico aceita `role: "admin"` sem autenticacao | `routes/auth.ts` | 52-100 |
| CRIT-04 | `SELECT *` em multiplas rotas expoe todas as colunas | `routes/incidents.ts`, `routes/kpis.ts`, `routes/tipos.ts` | incidents:13,67,98,135; kpis:11,37; tipos:11,34,57 |
| CRIT-05 | Zero rate limiting em toda a API (brute-force trivial) | `index.ts` | - |
| CRIT-06 | Credenciais admin hardcoded no seed.sql commitado no repo | `seed.sql` | 57 |

### 2.2 HIGH (5)

| ID | Vulnerabilidade | Arquivo(s) | Linha(s) |
|----|----------------|------------|----------|
| HIGH-01 | JWT em localStorage (XSS-acessivel, token de 24h) | `src/services/api.ts`, `src/contexts/AuthContext.tsx` | api:7, auth:54,65 |
| HIGH-02 | Sem security headers (Helmet ausente) | `index.ts` | - |
| HIGH-03 | CORS fallback para `'*'` quando CORS_ORIGIN nao definido | `index.ts` | 18 |
| HIGH-04 | Sem CSRF protection (necessario antes de migrar JWT p/ cookies) | `index.ts` | - |
| HIGH-05 | Sem validacao de comprimento em strings antes de INSERT/UPDATE | `routes/users.ts`, `routes/incidents.ts`, `routes/tipos.ts` | users:34-43, incidents:89-91, tipos:27-29 |

### 2.3 MEDIUM (7)

| ID | Vulnerabilidade | Arquivo(s) | Linha(s) |
|----|----------------|------------|----------|
| MED-01 | Sem validacao de enums (tipo, gravidade, status) | `routes/incidents.ts` | 87-92, 120-136 |
| MED-02 | `err: any` em catch blocks (deve ser `unknown`) | `routes/incidents.ts`, `routes/tipos.ts`, `routes/users.ts` | incidents:103, tipos:38, users:54,99 |
| MED-03 | Sem paginacao no GET /incidents (dump completo) | `routes/incidents.ts` | 9-62 |
| MED-04 | `rejectUnauthorized: false` desabilita verificacao TLS do DB | `db.ts` | 9 |
| MED-05 | Pool sem `max`, `idleTimeoutMillis`, `statement_timeout` | `db.ts` | 7-10 |
| MED-06 | Erro ecoa input do usuario (XSS em mensagem de erro) | `routes/users.ts`, `routes/auth.ts` | users:56,101, auth:71-desativado |
| MED-07 | Sem validacao de formato de email e complexidade de senha | `routes/auth.ts` | 56-64 |

### 2.4 LOW (5)

| ID | Vulnerabilidade | Arquivo(s) | Linha(s) |
|----|----------------|------------|----------|
| LOW-01 | Token 24h sem mecanismo de revogacao | `middleware/auth.ts` | 36 |
| LOW-02 | Enumeracao de email via mensagens distintas (401 vs 403) | `routes/auth.ts` | 22-32 |
| LOW-03 | Sem body size limit explicito no `express.json()` | `index.ts` | 21 |
| LOW-04 | `TIMESTAMP` sem timezone + `hora INTEGER` sem CHECK | `seed.sql` | 15, 33, 37 |
| LOW-05 | Coluna `role` sem CHECK constraint no banco | `seed.sql` | 13 |

---

## 3. Fases de Implementacao

---

### FASE 1 — Autenticacao e Credenciais (EMERGENCIAL)

**Objetivo:** Eliminar todas as vulnerabilidades CRITICAL relacionadas a autenticacao.
**Impacto:** 4 CRITs resolvidos (CRIT-01, CRIT-02, CRIT-03, CRIT-06)
**Novas deps:** `bcrypt`, `@types/bcrypt`

#### Tarefa 1.1 — Hashing de senhas com bcrypt

**Agente:** `security-reviewer` (analise) + implementacao manual
**Arquivos:** `api/routes/auth.ts`, `api/routes/users.ts`
**Resolve:** CRIT-01

Mudancas:
- `POST /login` (`auth.ts:8-50`):
  - Buscar usuario por email apenas: `SELECT id, nome, email, senha, cargo, role, ativo FROM users WHERE email = $1`
  - Comparar senha com `bcrypt.compare(senha, user.senha)`
  - Manter mesma resposta de erro para login invalido
- `POST /register` (`auth.ts:52-100`):
  - Hash da senha antes de INSERT: `const hash = await bcrypt.hash(senha, 12)`
  - INSERT usa `hash` no lugar de `senha` direto
- `POST /users` (`users.ts:27-62`):
  - Hash da senha antes de INSERT: `const hash = await bcrypt.hash(senha, 12)`
- `PUT /users/:id` (`users.ts:65-108`):
  - Se `senha` fornecida, hash antes de UPDATE: `const hash = senha ? await bcrypt.hash(senha, 12) : null`

Criterios de aceite:
- [ ] `bcrypt.compare()` usado no login (nunca comparacao direta SQL)
- [ ] Todas as escritas de senha usam `bcrypt.hash(value, 12)`
- [ ] Query de login busca por email apenas (traz `senha` hasheada para compare em JS)
- [ ] Login com credenciais corretas funciona
- [ ] Login com credenciais erradas retorna 401

#### Tarefa 1.2 — Remover fallback do JWT_SECRET

**Agente:** `security-reviewer`
**Arquivos:** `api/middleware/auth.ts`, `api/index.ts`
**Resolve:** CRIT-02

Mudancas:
- `middleware/auth.ts:4`: Remover `|| 'bombeiros-secret-dev'`
- Adicionar validacao de env vars obrigatorias no startup (`index.ts`):
  ```
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is required')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL env var is required')
  ```
- Exportar `JWT_SECRET` como constante validada (nao mais inline)

Criterios de aceite:
- [ ] Nenhum secret hardcoded no codigo
- [ ] App falha no startup se JWT_SECRET ausente
- [ ] App falha no startup se DATABASE_URL ausente

#### Tarefa 1.3 — Proteger/remover endpoint /register

**Agente:** `security-reviewer`
**Arquivos:** `api/routes/auth.ts`, `src/contexts/AuthContext.tsx`
**Resolve:** CRIT-03

Opcao escolhida: **Proteger com auth + role admin** (manter endpoint para uso futuro pelo painel admin)

Mudancas:
- `auth.ts:52`: Adicionar `authMiddleware, requireRole('admin')` antes do handler
- Remover aceitacao de `role` do body em requests nao-admin (redundante apos protecao)
- `AuthContext.tsx`: Remover funcao `register` do contexto (nunca deve ser chamado do frontend sem auth)
  - Se alguma tela usar register publico, remover essa funcionalidade

Criterios de aceite:
- [ ] `POST /register` requer JWT valido + role admin
- [ ] Request sem token retorna 401
- [ ] Request com token de visualizador retorna 403
- [ ] Frontend nao expoe registro publico

#### Tarefa 1.4 — Limpar seed.sql

**Agente:** `database-reviewer`
**Arquivos:** `api/seed.sql`
**Resolve:** CRIT-06

Mudancas:
- Remover senha literal `'admin123'` da linha 57
- Substituir por placeholder comentado:
  ```sql
  -- IMPORTANTE: Definir senha via script de setup, nunca hardcoded
  -- Gerar hash bcrypt e inserir manualmente:
  -- INSERT INTO users (nome, email, senha, cargo, role) VALUES
  --   ('Administrador', 'admin@bombeiros.gov.br', '$2b$12$HASH_AQUI', 'Administrador do Sistema', 'admin');
  ```
- **Acao manual pos-deploy:** Rotacionar senha do admin na VPS

Criterios de aceite:
- [ ] Nenhuma senha literal no seed.sql
- [ ] Comentario instrui como gerar hash bcrypt
- [ ] Senha do admin rotacionada em producao

#### Tarefa 1.5 — Migration: hashear senhas existentes no banco

**Agente:** `database-reviewer`
**Arquivo:** Novo `api/migrations/001_hash_passwords.ts`
**Depende de:** Tarefa 1.1

Mudancas:
- Script que:
  1. Conecta ao banco
  2. Busca todos os usuarios com `SELECT id, senha FROM users`
  3. Para cada usuario, `bcrypt.hash(senha, 12)` e UPDATE
  4. Altera coluna: `ALTER TABLE users ALTER COLUMN senha TYPE VARCHAR(255)` (bcrypt hash = 60 chars, margem para argon2 futuro)
- Executar uma unica vez contra o banco de producao

Criterios de aceite:
- [ ] Todas as senhas existentes convertidas para bcrypt hash
- [ ] Coluna `senha` comporta hash de 60+ chars
- [ ] Login funciona apos migracao

---

### FASE 2 — Infraestrutura de Seguranca

**Objetivo:** Adicionar camadas de protecao (rate limit, headers, CORS, body limit).
**Impacto:** CRIT-05, HIGH-02, HIGH-03, LOW-03
**Novas deps:** `express-rate-limit`, `helmet`

#### Tarefa 2.1 — Adicionar Helmet (security headers)

**Agente:** `build-error-resolver` (se conflito de tipos)
**Arquivo:** `api/index.ts`
**Resolve:** HIGH-02

Mudancas:
- Importar e adicionar `helmet()` como primeiro middleware (antes de CORS)
- Configuracao:
  ```typescript
  app.use(helmet({
    contentSecurityPolicy: false, // SPA servida separadamente
    crossOriginEmbedderPolicy: false,
  }))
  ```

Criterios de aceite:
- [ ] `X-Content-Type-Options: nosniff` presente nas respostas
- [ ] `X-Frame-Options` presente
- [ ] `Strict-Transport-Security` presente
- [ ] Build e tsc passam

#### Tarefa 2.2 — Adicionar Rate Limiting

**Agente:** `security-reviewer`
**Arquivos:** `api/index.ts`, `api/routes/auth.ts`
**Resolve:** CRIT-05

Mudancas:
- Rate limit global: 100 req/15min por IP
- Rate limit especifico para auth:
  - `/api/auth/login`: 10 req/15min por IP
  - `/api/auth/register`: 5 req/hora por IP
- Configuracao:
  ```typescript
  import rateLimit from 'express-rate-limit';

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisicoes. Tente novamente mais tarde.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  });
  ```

Criterios de aceite:
- [ ] Rate limit global aplicado
- [ ] Rate limit restritivo no login
- [ ] Resposta 429 com mensagem PT-BR
- [ ] Headers `RateLimit-*` presentes

#### Tarefa 2.3 — Enforcar CORS_ORIGIN obrigatorio

**Agente:** `security-reviewer`
**Arquivo:** `api/index.ts`
**Resolve:** HIGH-03

Mudancas:
- Remover fallback `|| '*'`
- Em producao, exigir CORS_ORIGIN definido
- Em dev, permitir `http://localhost:3000` como default
  ```typescript
  const corsOrigin = process.env.CORS_ORIGIN
    || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined);

  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN env var is required in production');
  }
  ```

Criterios de aceite:
- [ ] CORS nunca aceita `*`
- [ ] Producao falha se CORS_ORIGIN ausente
- [ ] Dev funciona com localhost default

#### Tarefa 2.4 — Body size limit explicito

**Agente:** `security-reviewer`
**Arquivo:** `api/index.ts`
**Resolve:** LOW-03

Mudancas:
- `app.use(express.json({ limit: '10kb' }))` — suficiente para payloads da API

Criterios de aceite:
- [ ] Payloads > 10kb retornam 413
- [ ] Payloads normais funcionam

---

### FASE 3 — Hardening de Queries e Validacao

**Objetivo:** Eliminar SELECT *, adicionar validacao de input, paginacao.
**Impacto:** CRIT-04, HIGH-05, MED-01 a MED-07

#### Tarefa 3.1 — Substituir SELECT * por colunas explicitas

**Agente:** `database-reviewer`
**Arquivos:** `api/routes/incidents.ts`, `api/routes/kpis.ts`, `api/routes/tipos.ts`
**Resolve:** CRIT-04

Mudancas por arquivo:

**incidents.ts:**
- Linha 13: `SELECT * FROM incidents` → `SELECT id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at FROM incidents`
- Linha 67: Idem para GET /:id
- Linha 98: `RETURNING *` → `RETURNING id, tipo, gravidade, bairro, status, data, hora, descricao, latitude, longitude, created_at`
- Linha 135: Idem para PUT

**kpis.ts:**
- Linha 11: `SELECT * FROM kpis` → `SELECT id, title, value, subtitle, icon, color, ordem FROM kpis`
- Linha 37: `RETURNING *` → `RETURNING id, title, value, subtitle, icon, color, ordem`

**tipos.ts:**
- Linha 11: `SELECT * FROM tipos_ocorrencia` → `SELECT id, nome, ativo FROM tipos_ocorrencia`
- Linha 34: `RETURNING *` → `RETURNING id, nome, ativo`
- Linha 57: Idem para DELETE soft

Criterios de aceite:
- [ ] Zero ocorrencias de `SELECT *` ou `RETURNING *` em toda a API
- [ ] Frontend continua funcionando (mesmos campos retornados)

#### Tarefa 3.2 — Validacao de input (comprimento + enum + formato)

**Agente:** `code-reviewer` (revisao) + implementacao
**Arquivos:** `api/routes/incidents.ts`, `api/routes/users.ts`, `api/routes/tipos.ts`, `api/routes/auth.ts`
**Resolve:** HIGH-05, MED-01, MED-06, MED-07

Criar helper de validacao em `api/utils/validation.ts`:

```typescript
export const VALID_GRAVIDADES = ['Baixa', 'Media', 'Alta', 'Critica'] as const;
export const VALID_STATUSES = ['Em Andamento', 'Finalizado', 'Pendente'] as const;
export const VALID_ROLES = ['admin', 'operador', 'visualizador'] as const;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateStringLength(value: string, field: string, max: number): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${field} nao pode ser vazio`;
  if (trimmed.length > max) return `${field} excede o limite de ${max} caracteres`;
  return null;
}

export function sanitizeErrorMessage(message: string): string {
  // Nao ecoar input do usuario em mensagens de erro
  return message;
}
```

Aplicar em cada rota:
- **auth.ts /register:** validar formato email, senha >= 8 chars + 1 maiuscula + 1 numero
- **users.ts POST/PUT:** validar nome (max 100), email (max 150, formato), cargo (max 100)
- **incidents.ts POST/PUT:** validar gravidade contra enum, status contra enum, bairro (max 100), descricao (max 2000), id formato `BMB-\d+`
- **tipos.ts POST:** validar nome (max 50)

Remover echo de input em mensagens de erro:
- `users.ts:56`: `Email "${email}" ja esta em uso` → `Este email ja esta cadastrado`
- `users.ts:101`: Idem
- `tipos.ts:40`: `Tipo "${nome}" ja existe` → `Este tipo ja esta cadastrado`
- `incidents.ts:105`: `Ocorrencia com ID "${id}" ja existe` → `Esta ocorrencia ja esta cadastrada`

Criterios de aceite:
- [ ] Todos os enums validados contra listas fixas
- [ ] Todos os strings validados por comprimento
- [ ] Email validado por formato
- [ ] Nenhuma mensagem de erro ecoa input do usuario
- [ ] 400 com mensagem PT-BR para input invalido

#### Tarefa 3.3 — Adicionar paginacao no GET /incidents

**Agente:** `database-reviewer`
**Arquivo:** `api/routes/incidents.ts`
**Resolve:** MED-03

Mudancas:
- Aceitar `page` e `limit` como query params (default: page=1, limit=50, max=100)
- Adicionar `LIMIT $N OFFSET $M` a query
- Adicionar COUNT query para total
- Retornar envelope paginado:
  ```json
  {
    "data": [...],
    "meta": { "total": 122, "page": 1, "limit": 50, "pages": 3 }
  }
  ```
- **ATENCAO:** Verificar se frontend espera array direto (`res.json(result.rows)`) e adaptar

Criterios de aceite:
- [ ] GET /incidents retorna no maximo 100 registros
- [ ] Paginacao funciona com parametros page/limit
- [ ] Meta com total/page/limit/pages presente
- [ ] Frontend adaptado para nova estrutura de resposta

#### Tarefa 3.4 — Corrigir err: any para err: unknown

**Agente:** `build-error-resolver`
**Arquivos:** `api/routes/incidents.ts:103`, `api/routes/tipos.ts:38`, `api/routes/users.ts:54,99`
**Resolve:** MED-02

Mudancas:
- Substituir `err: any` por `err: unknown`
- Usar type guard para acessar `.code`:
  ```typescript
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === '23505') {
      // duplicate key
    }
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Operacao falhou:', err);
    res.status(500).json({ error: message });
  }
  ```

Criterios de aceite:
- [ ] Zero ocorrencias de `err: any` na API
- [ ] `tsc --noEmit` passa sem erros
- [ ] Comportamento de duplicate key mantido

#### Tarefa 3.5 — Configurar pool PostgreSQL

**Agente:** `database-reviewer`
**Arquivo:** `api/db.ts`
**Resolve:** MED-05

Mudancas:
```typescript
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

Nota: `rejectUnauthorized: false` (MED-04) nao sera corrigido nesta iteracao — requer obter CA cert da VPS, que e uma tarefa operacional separada.

Criterios de aceite:
- [ ] Pool tem limite maximo de conexoes
- [ ] Timeout de idle e conexao definidos
- [ ] Conexao com VPS continua funcionando

---

### FASE 4 — Respostas Padronizadas e Anti-Enumeracao

**Objetivo:** Padronizar todas as respostas da API e eliminar vazamento de informacao.
**Impacto:** LOW-01 (parcial), LOW-02

#### Tarefa 4.1 — Unificar mensagens de erro de auth (anti-enumeracao)

**Agente:** `security-reviewer`
**Arquivo:** `api/routes/auth.ts`
**Resolve:** LOW-02

Mudancas:
- Login: retornar mesma resposta 401 para "usuario nao existe" e "conta desativada"
- Buscar por email apenas, verificar ativo + senha em codigo JS:
  ```typescript
  const result = await pool.query(
    'SELECT id, nome, email, senha, cargo, role, ativo FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  // Resposta identica para email errado, senha errada, e conta inativa
  if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha))) {
    res.status(401).json({ error: 'Credenciais invalidas' });
    return;
  }
  ```

Criterios de aceite:
- [ ] Mesma resposta 401 para todos os casos de login falho
- [ ] Nao e possivel enumerar emails validos via API

#### Tarefa 4.2 — Padronizar envelope de resposta

**Agente:** `code-reviewer`
**Arquivos:** Todas as rotas
**Resolve:** Padrao de qualidade

Garantir que todas as respostas seguem:
```typescript
// Sucesso
{ success: true, data: T }
{ success: true, data: T[], meta: { total, page, limit } }

// Erro
{ success: false, error: "mensagem em PT-BR" }
```

Nota: Varias rotas ja retornam `{ error: "..." }` sem o campo `success`. Padronizar gradualmente, com backward compatibility onde necessario.

Criterios de aceite:
- [ ] Todas as respostas de erro tem `{ success: false, error }`
- [ ] Respostas de sucesso tem `{ success: true, data }`

---

### FASE 5 — Database Constraints e Schema

**Objetivo:** Adicionar constraints no banco para validacao na camada de dados.
**Impacto:** LOW-04, LOW-05

#### Tarefa 5.1 — Migration: CHECK constraints + TIMESTAMPTZ

**Agente:** `database-reviewer`
**Arquivo:** Novo `api/migrations/002_schema_constraints.sql`
**Resolve:** LOW-04, LOW-05

```sql
-- Role constraint
ALTER TABLE users ADD CONSTRAINT check_role
  CHECK (role IN ('admin', 'operador', 'visualizador'));

-- Hora constraint
ALTER TABLE incidents ADD CONSTRAINT check_hora
  CHECK (hora IS NULL OR (hora >= 0 AND hora <= 23));

-- Gravidade constraint
ALTER TABLE incidents ADD CONSTRAINT check_gravidade
  CHECK (gravidade IN ('Baixa', 'Media', 'Alta', 'Critica'));

-- Status constraint
ALTER TABLE incidents ADD CONSTRAINT check_status
  CHECK (status IN ('Em Andamento', 'Finalizado', 'Pendente'));

-- Timestamps: migrar para TIMESTAMPTZ
ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE incidents ALTER COLUMN created_at TYPE TIMESTAMPTZ;

-- Indexes para queries frequentes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_data ON incidents(data);
CREATE INDEX IF NOT EXISTS idx_incidents_tipo ON incidents(tipo);
CREATE INDEX IF NOT EXISTS idx_incidents_gravidade ON incidents(gravidade);
CREATE INDEX IF NOT EXISTS idx_kpis_ordem ON kpis(ordem);
CREATE INDEX IF NOT EXISTS idx_tipos_ativo ON tipos_ocorrencia(ativo);
```

Criterios de aceite:
- [ ] Constraints aplicados sem erro no banco existente
- [ ] Dados existentes compatíveis com constraints
- [ ] Indexes criados

---

## 4. Mapa de Agentes por Fase

### Legenda de Agentes

| Agente | Responsabilidade |
|--------|-----------------|
| `security-reviewer` | Analise e implementacao de fixes de seguranca (auth, tokens, CORS, rate limit) |
| `database-reviewer` | Queries, schema, migrations, pool config |
| `build-error-resolver` | Resolver erros de TypeScript/build apos mudancas |
| `code-reviewer` | Revisar qualidade do codigo implementado |
| `planner` | Coordenacao e planejamento (ja executado — este PRD) |
| `architect` | Decisoes arquiteturais (envelope de resposta, estrutura de validacao) |

### Atribuicao por Tarefa

```
FASE 1 — Autenticacao e Credenciais
├── 1.1 Hashing bcrypt ............... security-reviewer (implementa)
│                                     → build-error-resolver (se tsc falhar)
│                                     → code-reviewer (revisao final)
├── 1.2 Remover JWT fallback ........ security-reviewer (implementa)
├── 1.3 Proteger /register .......... security-reviewer (implementa)
├── 1.4 Limpar seed.sql ............. database-reviewer (implementa)
└── 1.5 Migration hash senhas ....... database-reviewer (implementa + executa)

FASE 2 — Infraestrutura de Seguranca
├── 2.1 Helmet ...................... security-reviewer (implementa)
│                                     → build-error-resolver (se conflito tipos)
├── 2.2 Rate limiting ............... security-reviewer (implementa)
├── 2.3 CORS enforced ............... security-reviewer (implementa)
└── 2.4 Body size limit ............. security-reviewer (implementa)

FASE 3 — Hardening de Queries
├── 3.1 Eliminar SELECT * ........... database-reviewer (implementa)
├── 3.2 Validacao de input .......... security-reviewer (implementa)
│                                     → code-reviewer (revisao)
├── 3.3 Paginacao incidents ......... database-reviewer (implementa)
│                                     → architect (decisao envelope)
├── 3.4 err:any → err:unknown ....... build-error-resolver (implementa)
└── 3.5 Pool config ................. database-reviewer (implementa)

FASE 4 — Respostas e Anti-Enumeracao
├── 4.1 Unificar erros auth ......... security-reviewer (implementa)
└── 4.2 Envelope padronizado ........ architect (design)
                                      → code-reviewer (revisao)

FASE 5 — Database Constraints
└── 5.1 Migration constraints ....... database-reviewer (implementa + executa)
```

### Execucao Paralela Possivel

```
FASE 1 (tarefas podem rodar em paralelo parcial):
  [1.1 bcrypt] ──────────────────────→ [1.5 migration] (depende de 1.1)
  [1.2 JWT fallback] ────→ (independente)
  [1.3 proteger /register] ────→ (independente)
  [1.4 limpar seed] ────→ (independente)

FASE 2 (todas independentes — paralelo total):
  [2.1 helmet] ────→
  [2.2 rate limit] ────→    (podem rodar simultaneamente)
  [2.3 CORS] ────→
  [2.4 body limit] ────→

FASE 3 (parcialmente paralela):
  [3.1 SELECT *] ────→
  [3.2 validacao] ────→     (podem rodar simultaneamente)
  [3.3 paginacao] ────→     (independente, mas afeta frontend)
  [3.4 err:unknown] ────→   (independente)
  [3.5 pool config] ────→   (independente)

FASE 4 (sequencial — depende de F1):
  [4.1 anti-enumeracao] ────→ [4.2 envelope] (4.1 depende de 1.1 bcrypt)

FASE 5 (independente — pode rodar a qualquer momento):
  [5.1 constraints + indexes]
```

---

## 5. Verificacao Pos-Implementacao

Apos cada fase, rodar o pipeline de verificacao:

```bash
# 1. TypeScript check (frontend + backend)
npm run lint && npx tsc --noEmit -p api/tsconfig.json

# 2. Build de producao
npm run build

# 3. Smoke test API local
npm run api:dev &
curl -s http://localhost:3001/api/health | jq .
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@bombeiros.gov.br","senha":"admin123"}'

# 4. Verificar security headers
curl -I http://localhost:3001/api/health

# 5. Verificar rate limiting
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3001/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@test.com","senha":"wrong"}'
  echo ""
done
# Deve retornar 429 apos 10 tentativas
```

---

## 6. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Migration de senhas falha no banco de producao | Alto | Backup antes, rollback script preparado |
| Frontend quebra com paginacao (F3.3) | Medio | Testar localmente antes de deploy, adapter no frontend |
| Rate limiting bloqueia usuarios legitimos | Baixo | Limites generosos (100 req/15min global), monitorar |
| CORS restritivo bloqueia frontend | Alto | Testar em staging com CORS_ORIGIN correto |
| Constraints SQL conflitam com dados existentes | Medio | Verificar dados antes de aplicar CHECK constraints |

---

## 7. Criterios de Conclusao

- [ ] Zero vulnerabilidades CRITICAL abertas
- [ ] Zero vulnerabilidades HIGH abertas
- [ ] Todas as MEDIUM resolvidas ou com plano documentado
- [ ] `npm run lint` passa
- [ ] `npx tsc --noEmit -p api/tsconfig.json` passa
- [ ] `npm run build` sucesso
- [ ] Login funciona em producao
- [ ] CRUD incidents funciona
- [ ] Admin panel funciona
- [ ] Security headers presentes nas respostas
- [ ] Rate limiting ativo
