# Regras de Código

## Linguagem e Framework
- React 19 + TypeScript + Vite
- Componentes funcionais com hooks (nunca class components)
- Imports com alias `@/` para raiz do projeto

## Estilização
- Tailwind CSS v4 exclusivamente — nunca CSS inline ou styled-components
- Usar tokens customizados do tema: `fire-dark`, `fire-card`, `fire-red`, `fire-orange`, `fire-green`, `fire-sidebar`, `fire-muted`
- Exemplo: `bg-fire-card`, `text-fire-red`, `border-fire-muted`
- Nunca usar cores raw (hex, rgb) — sempre tokens

## Estrutura de Componentes
- Um componente por arquivo
- Nome do arquivo = nome do componente (PascalCase)
- Componentes compartilhados em `src/components/`
- Páginas em `src/pages/`
- Dados e tipos em `src/data/`

## Navegação
- Sem router library — navegação via estado `Page` em `App.tsx`
- Novas páginas devem ser adicionadas ao union type `Page`
- Props de navegação: `onNavigate`, `currentPage`

## TypeScript
- Strict mode habilitado
- Interfaces para props de componentes
- Evitar `any` — usar tipos explícitos
- Export nomeado (não default) quando possível

## Imports
- Ordem: React → libs externas → componentes → dados/utils → tipos
- Usar `@/` alias ao invés de caminhos relativos longos
