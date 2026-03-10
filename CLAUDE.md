# CLAUDE.md — Bombeiros

Sistema de monitoramento e gestão de ocorrências para corpo de bombeiros.

## Comandos

```bash
npm run dev      # Dev server em http://localhost:3000
npm run build    # Build de produção
npm run lint     # Type-check (tsc --noEmit)
npm run preview  # Preview do build
```

## Ambiente

Copiar `.env.example` para `.env.local` e definir `GEMINI_API_KEY`.

## Referências Rápidas

| O quê | Onde |
|---|---|
| Regras de código | `.claude/rules/coding.md` |
| Regras de teste | `.claude/rules/testing.md` |
| Skill: review | `.claude/skills/review/SKILL.md` |
| Skill: refactor | `.claude/skills/refactor/SKILL.md` |
| Arquitetura completa | `docs/architecture.md` |
| Decisões (ADRs) | `docs/decisions/` |
| Output styles | `.claude/output-styles/` |

## Arquitetura (resumo)

- SPA React 19 + TypeScript + Vite (sem router library)
- Navegação via estado `Page` em `App.tsx`
- Tailwind CSS v4 — usar tokens `fire-*` (nunca cores raw)
- Dados mock em `src/data/mockData.ts` — **migração para banco real planejada**

## Estrutura

```
src/
├── components/   # Componentes compartilhados (Sidebar, Topbar, KpiCards, etc.)
├── pages/        # Páginas (RelatoriosPage, MapaPage, ConfiguracoesPage)
├── data/         # Mock data e tipos
App.tsx           # Dashboard + navegação

.claude/          # Contexto para IA
├── rules/        # Regras operacionais
├── skills/       # Workflows reutilizáveis
├── output-styles/# Estilos de resposta

docs/             # Documentação do projeto
├── architecture.md
├── decisions/    # ADRs
├── runbooks/     # Processos operacionais
```
