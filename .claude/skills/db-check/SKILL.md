# Skill: Database Consistency Check

Verificar consistencia entre schema SQL, interfaces TypeScript, rotas da API e services do frontend.

## Quando usar

Apos mudancas no banco, ou quando suspeitar de inconsistencias. Invocar via `/db-check`.

## Checklist

### 1. Schema vs Interfaces TypeScript
Comparar tabelas em `api/seed.sql` com interfaces em `src/data/`:
- [ ] Todas as colunas do banco estao representadas na interface
- [ ] Tipos estao corretos (DATE -> string, SERIAL -> number, VARCHAR -> string, BOOLEAN -> boolean)
- [ ] Colunas nullable marcadas com `?` na interface
- [ ] Nenhuma coluna da interface que nao existe no banco

### 2. Rotas vs Schema
Para cada rota em `api/routes/`:
- [ ] Colunas referenciadas nas queries existem no schema
- [ ] INSERT/UPDATE incluem todas as colunas obrigatorias (NOT NULL sem DEFAULT)
- [ ] SELECT nao usa colunas removidas ou renomeadas
- [ ] Queries parametrizadas (`$1, $2...`) — nao string concatenation
- [ ] SELECT com colunas explicitas (nao `SELECT *`)

### 3. Services vs Rotas
Para cada service em `src/services/`:
- [ ] Payload enviado corresponde ao que a rota espera
- [ ] Resposta parseada corresponde a interface TypeScript
- [ ] Campos opcionais tratados corretamente
- [ ] Formato de resposta `{ success, data/error }` consistente

### 4. Indices e Performance
- [ ] `incidents.data` tem indice (filtro frequente)
- [ ] `incidents.status` tem indice (filtro frequente)
- [ ] `users.email` tem indice UNIQUE
- [ ] Queries com WHERE/ORDER BY usam colunas indexadas

### 5. Seguranca do Schema
- [ ] Campos de senha nao retornados em SELECT (exceto login)
- [ ] Foreign keys com ON DELETE adequado
- [ ] Constraints de CHECK onde aplicavel (ex: role IN ('admin','operador','visualizador'))

## Output

Tabela com status de cada verificacao. Se encontrar inconsistencias, listar a correcao necessaria com prioridade.

## Agents de Suporte

- **database-reviewer** (ECC) — Para analise profunda de queries e schema