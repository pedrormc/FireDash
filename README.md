<div align="center">

# 🔥 Bombeiros — Sistema de Monitoramento de Ocorrências

**Painel de comando em tempo real para gestão de ocorrências do Corpo de Bombeiros**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## Sobre o Projeto

Sistema web para monitoramento e gestão de ocorrências do corpo de bombeiros, com dashboard interativo, mapa de calor, gráficos analíticos e geração de relatórios com IA (Gemini).

### Funcionalidades

- **Dashboard** — KPIs em tempo real, tabela de ocorrências, status do sistema e alertas ativos
- **Mapa Interativo** — Visualização georreferenciada de ocorrências com Leaflet
- **Relatórios** — Geração de relatórios analíticos com auxílio de IA (Google Gemini)
- **Gráficos** — Análises visuais de tendências e distribuição de ocorrências
- **Configurações** — Personalização do painel e preferências do usuário
- **Novo Alerta** — Cadastro rápido de novas ocorrências

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estilização | Tailwind CSS v4 (tema customizado `fire-*`) |
| Mapas | Leaflet + React-Leaflet |
| Gráficos | Recharts |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| IA | Google GenAI SDK (Gemini) |

---

## Estrutura do Projeto

```
src/
├── components/       # Componentes compartilhados
│   ├── Sidebar.tsx          # Navegação lateral
│   ├── Topbar.tsx           # Barra superior dinâmica
│   ├── KpiCards.tsx         # Cards de indicadores
│   ├── MapSection.tsx       # Mapa interativo
│   ├── ChartsSection.tsx    # Gráficos analíticos
│   ├── SystemStatus.tsx     # Status do sistema
│   ├── IncidentTable.tsx    # Tabela de ocorrências
│   ├── IncidentModal.tsx    # Detalhes de ocorrência
│   ├── NovoAlertaModal.tsx  # Criar novo alerta
│   └── ZoneStatus.tsx       # Status por zona
├── pages/            # Páginas da aplicação
│   ├── RelatoriosPage.tsx
│   ├── MapaPage.tsx
│   └── ConfiguracoesPage.tsx
├── data/             # Dados mock e tipos
│   └── mockData.ts
└── App.tsx           # Dashboard + navegação central
```

---

## Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- Chave de API do [Google Gemini](https://ai.google.dev/)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/bombeiros.git
cd bombeiros

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local e definir GEMINI_API_KEY
```

### Comandos

```bash
npm run dev       # Inicia o servidor de desenvolvimento em http://localhost:3000
npm run build     # Gera o build de produção
npm run preview   # Preview do build de produção
npm run lint      # Verificação de tipos (tsc --noEmit)
```

---

## Arquitetura

A aplicação é uma **SPA (Single Page Application)** sem router library. A navegação é controlada via estado `Page` no `App.tsx`, com o componente `Sidebar` disparando mudanças de página.

```
App.tsx (estado Page controla a navegação)
├── Dashboard (renderizado inline)
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

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `GEMINI_API_KEY` | Chave da API Google Gemini para geração de relatórios com IA |

---

## Roadmap

- [ ] Migração de dados mock para banco PostgreSQL
- [ ] Sistema de autenticação (login/senha com 3 níveis de acesso)
- [ ] API backend com Node.js + Express
- [ ] Painel administrativo (CRUD de usuários)
- [ ] Deploy na Vercel (frontend + serverless functions)

---

## Licença

Este projeto é de uso privado.
