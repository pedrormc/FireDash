# Skill: Security Review

Auditoria de segurança completa para o projeto Bombeiros. Use o agent **security-reviewer** para análises profundas.

## Quando usar

Antes de deploy, após mudanças em auth/API, ou quando solicitado via `/security-review`.

## Checklist

### 1. SQL Injection (CRITICAL)
- [ ] Todas as queries usam `$1, $2...` parameterized (nunca string concatenation)
- [ ] Nenhum input do usuário é interpolado diretamente em SQL
- [ ] Verificar todas as rotas em `api/routes/` com `grep` por concatenação em queries

### 2. Autenticação (CRITICAL)
- [ ] Todas as rotas (exceto `/login` e `/health`) passam por `authMiddleware`
- [ ] Rotas admin-only usam `requireRole('admin')`
- [ ] Token JWT tem expiração definida
- [ ] Senha nunca é retornada nas responses da API (nem em `GET /me`)
- [ ] Login retorna erro genérico para email/senha inválidos

### 3. Autorização / Roles (HIGH)
- [ ] `visualizador` só tem acesso read-only ao Dashboard
- [ ] `operador` não consegue acessar rotas de admin
- [ ] Frontend usa `ProtectedRoute` para controle de acesso visual
- [ ] Backend valida role mesmo que frontend esconda o botão

### 4. XSS (HIGH)
- [ ] Nenhum uso de `dangerouslySetInnerHTML`
- [ ] Input do usuário é escapado antes de renderizar
- [ ] Headers de segurança configurados

### 5. Validação de Input (HIGH)
- [ ] Campos obrigatórios verificados no backend
- [ ] Strings trimadas e com limite de comprimento
- [ ] IDs numéricos validados como inteiros positivos
- [ ] Enums validados contra valores permitidos

### 6. Dados Sensíveis (CRITICAL)
- [ ] `.env.local` está no `.gitignore`
- [ ] Nenhum secret hardcoded no código fonte
- [ ] `console.error` não loga dados sensíveis (senhas, tokens completos)
- [ ] CORS configurado com origem explícita (não `*`)

### 7. Error Handling Seguro (MEDIUM)
- [ ] Stack traces não expostos ao cliente
- [ ] Mensagens de erro não revelam estrutura interna
- [ ] 500 retorna mensagem genérica

### Divida Tecnica Conhecida

| Prioridade | Item | Status |
|---|---|---|
| P0 | Senhas em texto plano (migrar para bcrypt) | Pendente |
| P0 | JWT em localStorage (migrar para httpOnly cookies) | Pendente |
| P1 | Sem rate limiting nas rotas de auth | Pendente |
| P1 | Sem validacao de comprimento/formato em inputs | Pendente |
| P2 | Sem CSRF protection | Pendente |

## Output

Checklist com status: **PASS** / **FAIL** (com correcao) / **DEBT** (divida aceita).

## Agents de Suporte

- **security-reviewer** — Para audit completa automatizada
