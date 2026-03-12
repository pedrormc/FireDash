# Skill: Refactor

Workflow de refatoracao segura. Use os agents **planner** (para planejar) e **refactor-cleaner** (para dead code).

## Quando usar

Quando precisar reestruturar codigo sem mudar comportamento. Invocar via `/refactor`.

## Workflow

### 1. Analisar
- Ler **todo** o codigo afetado antes de propor mudancas
- Identificar dependencias entre arquivos
- Verificar se ha testes cobrindo o codigo (rodar testes primeiro se existirem)

### 2. Planejar
- Listar as mudancas necessarias e ordem de execucao
- Identificar riscos (quebra de props, imports, tipos)
- Para refactors grandes: usar agent **planner**

### 3. Executar (Incremental)
- Fazer mudancas incrementais, validando a cada passo
- Rodar `npm run lint` apos cada mudanca significativa
- Nunca mudar comportamento — apenas estrutura

### 4. Verificar
```bash
npm run lint                              # Frontend
npx tsc --noEmit -p api/tsconfig.json     # Backend
npm run build                             # Build
npm run test -- --run                     # Testes (quando configurado)
```

### 5. Cleanup
- Remover imports nao usados
- Remover variaveis/funcoes orfas
- Usar agent **refactor-cleaner** para dead code

## Regras do Projeto

- Manter compatibilidade com navegacao via estado `Page` em `App.tsx`
- Preservar tokens de tema Tailwind (`fire-*`)
- Nao quebrar props existentes sem atualizar **todos** os consumidores
- Ao extrair componentes: `src/components/` (compartilhados) vs `src/pages/` (paginas)
- Imutabilidade: nunca introduzir mutacao durante refactor
- Funções < 50 linhas, arquivos < 800 linhas

## Agents de Suporte

- **planner** — Para refactors complexos multi-arquivo
- **refactor-cleaner** — Para remocao de dead code
- **code-reviewer** — Para review pos-refactor
