# Arquitetura do Sistema — Bombeiros

## Visão Geral

Sistema de monitoramento e gestão de ocorrências para corpo de bombeiros. Atualmente é uma SPA client-side pura (React + Vite), em processo de migração para incluir backend com banco de dados real.

## Stack Atual
- **Frontend:** React 19, TypeScript, Vite
- **Estilização:** Tailwind CSS v4 com tema customizado (`fire-*`)
- **Mapas:** Leaflet + React-Leaflet
- **Gráficos:** Recharts
- **Animações:** Motion (Framer Motion)
- **Ícones:** Lucide React
- **IA:** Google GenAI SDK (Gemini)

## Estrutura de Páginas

```
App.tsx (gerencia navegação via estado Page)
├── Dashboard (inline no App.tsx)
│   ├── KpiCards
│   ├── MapSection
│   ├── ChartsSection
│   ├── SystemStatus
│   ├── IncidentTable
│   └── ZoneStatus
├── RelatoriosPage
├── MapaPage
└── ConfiguracoesPage
```

## Fluxo de Navegação

Sem router library. O estado `currentPage` em `App.tsx` controla qual página é renderizada. O `Sidebar` dispara `onNavigate` para mudar de página.

## Dados

**Estado atual:** Todos os dados vêm de `src/data/mockData.ts` (alertas, KPIs, incidentes, emergências).

**Migração planejada:** Substituir mock data por banco de dados real (ver `docs/decisions/001-migracao-banco-dados.md`).

## Componentes Compartilhados

| Componente | Responsabilidade |
|---|---|
| Sidebar | Navegação lateral, botão novo alerta |
| Topbar | Título dinâmico por página |
| KpiCards | Cards de indicadores |
| MapSection | Mapa interativo com Leaflet |
| ChartsSection | Gráficos com Recharts |
| SystemStatus | Status do sistema |
| IncidentTable | Tabela de ocorrências |
| IncidentModal | Detalhes de ocorrência |
| NovoAlertaModal | Criar novo alerta |
| ZoneStatus | Status por zona |
