# Skill: Refactor

Ao refatorar código neste projeto:

1. **Analisar** — Ler todo o código afetado antes de propor mudanças
2. **Planejar** — Listar as mudanças necessárias e dependências entre arquivos
3. **Executar** — Fazer mudanças incrementais, validando a cada passo
4. **Verificar** — Rodar `npm run lint` e `npm run build` após refatoração

## Regras
- Manter compatibilidade com o sistema de navegação via estado em `App.tsx`
- Preservar tokens de tema Tailwind (`fire-*`)
- Não quebrar props existentes de componentes sem atualizar todos os consumidores
- Ao extrair componentes, manter no diretório correto (`components/` vs `pages/`)
