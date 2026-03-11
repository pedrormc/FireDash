# Relatório de Testes Automatizados (TestSprite)

---

## 1️⃣ Document Metadata
- **Project Name:** Bombeiros (FireDash)
- **Role:** Frontend Verification

---

## 2️⃣ Requirement Validation Summary

Foram executados **13 testes automatizados** no frontend da aplicação, focados inicialmente nas interações de tela, fluxos de acesso, permissões e cadastro.

### 🔴 Funcionalidades com Falhas Críticas (Gaps)

**1. Formulário de Registro (Incompleto/Faltando campos lógicos)**
- **TC001, TC002, TC007:** A funcionalidade de criação de conta não está aderente ao esperado pelos testes devido à ausência de um `<select>` ou dropdown para escolha de **"Role"** (cargo/perfil de usuário) obrigatório.  Atualmente existe apenas o input de texto livre `Cargo (opcional)`. Isso impossibilitou testes de criar `admin` ou `operator`.
- **TC003, TC004, TC006:** O sistema ou retornou uma tela vazia (SPA crash/blank page) ou não apresentou interatividade ao tentar forçar mensagens de erro de "campos obrigatórios" (`Name is required`, `Email is required`, `Password is required`).

**2. Acesso ao Dashboard (Login falhando na automação)**
- **TC008, TC009, TC010:** Os testes não conseguiram autenticar na plataforma. Ao submeter credenciais válidas (como `example@gmail.com` / `password123` e credenciais de admin), o aplicativo manteve a tela de login ou apresentou validações client-side que travaram o fluxo (`Please fill out this field.`). Com isso, a visualização de KPIs, Gráficos e Tabelas de incidentes não pôde ser verificada.
- **TC011, TC012:** Ao não conseguir logar ou não possuir dados `mockados` carregados com sucesso no acesso, a tabela exibiu `"Nenhum registro encontrado."`, bloqueando o teste de deletar e as validações de permissões (se um `visualizador` pode ou não apagar registros).

### 🟢 Testes Aprovados

- **TC005:** Validação de formato de e-mail malformado no registro funciona bloqueando o cadastro (✅ Passed).
- **TC013:** A troca de filtros apresenta visualmente o estado de carregamento (loading indicator) e atualiza a referência dos incidentes (✅ Passed).

---

## 3️⃣ Coverage & Matching Metrics

- **Taxa de Sucesso:** 15.38% (2 / 13 testes passaram).

| Requirement / Scope           | Total Tests | ✅ Passed | ❌ Failed  |
|-------------------------------|-------------|-----------|------------|
| Auth: Registration            | 7           | 1         | 6          |
| Auth: Login & Authentication  | 3           | 0         | 3          |
| Dashboard: Visualization/Data | 1           | 0         | 1          |
| Data Integrity: Access Control| 1           | 0         | 1          |
| UI/UX: Interactivity (Filters)| 1           | 1         | 0          |

---

## 4️⃣ Key Gaps / Risks

1. A **Tela de Cadastro** não está aderente à estrutura relacional do sistema. Para que o controle de acesso por páginas (Admin, Operador, Visualizador) funcione corretamente desde o cadastro, é necessário um campo fechado (Select dropdown) contendo os "Roles" exatos e que este seja obrigatório ('admin', 'operador', 'visualizador').
2. **Crash/Timeout do Client (`blank page`)**: Em algumas interações forçadas do sistema de teste a tela ficou sem elementos interativos. Podem existir crashes de Roteamento React não tratados adequadamente através de Error Boundaries.
3. A **Tela de Login** possui validações de componentes HTML (`required`) que entram em conflito em headless-mode ou a requisição da API de autenticação não está retornando respostas dentro do timeout estipulado (API não instanciou rápido o suficiente / Vercel Cold Start no backend de testes local).

### Recomendação Imediata:
Implementar o dropdown com a lista de perfis ("Role") no componente [RegisterPage.tsx](file:///c:/Users/teste/Desktop/AAsites-antigra/Bombeiros/src/pages/RegisterPage.tsx) e reavaliar como estão sendo disparados os dados no formulário de acesso ([LoginPage.tsx](file:///c:/Users/teste/Desktop/AAsites-antigra/Bombeiros/src/pages/LoginPage.tsx)).
