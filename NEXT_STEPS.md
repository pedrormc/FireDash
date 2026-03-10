# Próximos Passos — Bombeiros

## Estado Atual
A Fase 1 (Backend) do PRD está quase completa. Todo o código da API foi criado e compila sem erros. Faltam apenas os passos de infraestrutura (banco na VPS) e testes.

## Para Continuar (antes da Fase 2)

### 1. Configurar PostgreSQL na VPS
```bash
# Na VPS, como superuser do PostgreSQL:
psql -U postgres

CREATE DATABASE bombeiros;
\q
```

### 2. Rodar o seed do banco
```bash
# Na VPS:
psql -U postgres -d bombeiros -f seed.sql
# Ou copiar o conteúdo de api/seed.sql e executar no client SQL
```

### 3. Configurar variáveis de ambiente
Criar `.env.local` na raiz do projeto com:
```env
GEMINI_API_KEY=<sua-chave>
DATABASE_URL=postgresql://<user>:<password>@<VPS_IP>:5432/bombeiros
JWT_SECRET=<chave-secreta-qualquer>
DB_SSL=false
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 4. Testar o backend localmente
```bash
npm run api:dev
# API rodando em http://localhost:3001

# Testar health check:
curl http://localhost:3001/api/health

# Testar login:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bombeiros.gov.br","senha":"admin123"}'

# Usar o token retornado para testar outras rotas:
curl http://localhost:3001/api/incidents \
  -H "Authorization: Bearer <token>"
```

### 5. Iniciar Fase 2 (Frontend Auth)
Após confirmar que o backend funciona, seguir o checklist da Fase 2 no `PRD.md`:
- Criar `src/services/api.ts` (fetch wrapper)
- Criar `src/contexts/AuthContext.tsx`
- Criar `src/pages/LoginPage.tsx`
- Integrar auth no `App.tsx`

## Referência Rápida de Rotas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Login (email + senha) |
| `GET` | `/api/auth/me` | Dados do usuário logado |
| `GET` | `/api/incidents` | Listar ocorrências (filtros via query) |
| `POST` | `/api/incidents` | Criar ocorrência |
| `PUT` | `/api/incidents/:id` | Atualizar ocorrência |
| `DELETE` | `/api/incidents/:id` | Remover ocorrência |
| `GET` | `/api/kpis` | Listar KPIs |
| `PUT` | `/api/kpis/:id` | Atualizar KPI |
| `GET` | `/api/tipos` | Listar tipos de ocorrência |
| `GET` | `/api/users` | Listar usuários (admin) |
| `POST` | `/api/users` | Criar usuário (admin) |

## Credenciais Padrão (seed)
- **Email:** admin@bombeiros.gov.br
- **Senha:** admin123
- **Role:** admin
