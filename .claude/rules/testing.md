# Regras de Teste

## Estado Atual
- Nenhum test runner configurado
- Validação feita via `npm run lint` (tsc --noEmit)

## Validação Obrigatória
- Sempre rodar `npm run lint` antes de considerar uma tarefa concluída
- Garantir que `npm run build` compila sem erros
- Backend: verificar type-check com `npx tsc --noEmit -p api/tsconfig.json`

## Testes Manuais da API
- Usar `npm run api:dev` para subir o backend local
- Testar rotas via curl, Postman ou similar
- Credenciais padrão: `admin@bombeiros.gov.br` / `admin123`
- Health check: `GET /api/health`

## Futuro
- Quando testes forem adicionados, este arquivo será atualizado com convenções
