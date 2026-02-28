# Bella Design Hub

Plataforma da marcenaria Bella Design para operação comercial, ordens de serviço, produção e financeiro em uma única interface. O projeto combina API REST em .NET 8, SPA React e infraestrutura com Docker Compose.

## Funcionalidades da aplicação

- **Home da operação** com branding Bella Design e visão geral da proposta do sistema.
- **Clientes**: CRUD completo, busca por nome e uso integrado em pedidos e ordens de serviço.
- **Pedidos**:
  - CRUD completo com itens e cálculo automático de total.
  - Filtros por cliente e status.
  - Status operacionais (`Pending`, `InProduction`, `Shipped`, `Delivered`, `Cancelled`) e leitura de atraso na interface (`Atrasado`).
  - Painel lateral com detalhes, timeline visual do andamento e composição de itens.
- **Ordens de serviço**:
  - Geração a partir de um pedido existente.
  - Inclusão de itens adicionais de serviço.
  - CRUD completo e atualização de status.
  - Visualização detalhada e impressão em 2 vias (com dados do cliente, itens e assinatura).
- **Despesas**:
  - CRUD completo.
  - Filtros por mês e categoria (`Materials`, `Labor`, `Logistics`, `Utilities`, `Other`).
  - Totalização do período filtrado.
- **Produção**:
  - Catálogo de produtos com preço padrão, ativação e lista de peças.
  - Planejamento diário por data e quantidade.
  - Cálculo automático de peças/insumos por item planejado.
  - Consolidação de peças do dia e impressão do plano diário.
- **Financeiro**:
  - Visão mensal de caixa.
  - Faturamento calculado pelos pedidos entregues no mês.
  - Resultado (receita - despesas) e resumo por período.

## Arquitetura

| Camada | Stack | Responsabilidade |
|--------|-------|------------------|
| Backend | ASP.NET Core 8 + EF Core + PostgreSQL | API REST para clientes, pedidos, ordens de serviço, despesas, produtos e produção. |
| Frontend | React 19 + Vite + TypeScript + React Query + Tailwind CSS | SPA com módulos operacionais e formulários validados com React Hook Form + Zod. |
| Infra | Docker Compose + GitHub Actions | Orquestração local (API, frontend, banco) e pipelines de build/teste/publicação de imagens. |

Estrutura:

```text
backend/   API .NET (Domain, Application, Infrastructure, Api)
frontend/  SPA React (Vite + TypeScript)
infra/     Docker Compose, SQL de seed e utilitários
```

## Backend

- **Camadas**: `Domain`, `Application`, `Infrastructure` e `Api`.
- **Endpoints REST**:
  - `api/customers`: CRUD de clientes.
  - `api/orders`: CRUD de pedidos + filtros (`customerId`, `status`, `createdFrom`, `createdTo`).
  - `api/serviceOrders`: CRUD de ordens de serviço + filtros (`customerId`, `orderId`, `status`, `scheduledFrom`, `scheduledTo`) + `PATCH /status`.
  - `api/expenses`: CRUD de despesas + filtros (`startDate`, `endDate`, `category`).
  - `api/products`: CRUD de produtos e peças.
  - `api/productionSchedules`: CRUD de planejamento de produção + filtros (`scheduledDate`, `startDate`, `endDate`, `status`) + `PATCH /status`.
- **Infra de dados**:
  - Migrações aplicadas automaticamente na inicialização da API.
  - Script de seed em `infra/sql/seed-data.sql`.
- **Observabilidade e runtime**:
  - Health check em `/health`.
  - Swagger habilitado em ambiente de desenvolvimento.
  - CORS por `Cors__AllowedOrigins` (origens separadas por `;`), com fallback local fora de produção.
  - Migrações automáticas controladas por `Database__ApplyMigrationsOnStartup`.

## Frontend

- **Stack**: React 19, React Router, React Query, React Hook Form + Zod, Axios e Tailwind CSS.
- **Rotas**:
  - `/` home
  - `/finance` financeiro
  - `/customers` clientes
  - `/orders` pedidos
  - `/service-orders` ordens de serviço
  - `/expenses` despesas
  - `/production` produção
- **UX da operação**:
  - Modais de criação/edição.
  - Feedback de sucesso/erro por ação.
  - Tabelas com filtros e estados de carregamento/erro.
  - Impressão dedicada para OS e plano de produção.

## Como rodar localmente

### Pré-requisitos

- .NET SDK 8.0
- Node.js 20+ e npm
- Docker (opcional)

### Backend

```bash
cd backend
dotnet restore BellaDesignHub.sln
dotnet run --project src/BellaDesignHub.Api/BellaDesignHub.Api.csproj
```

Para aplicar migrações manualmente:

```bash
cd backend
dotnet ef database update --project src/BellaDesignHub.Infrastructure/BellaDesignHub.Infrastructure.csproj --startup-project src/BellaDesignHub.Api/BellaDesignHub.Api.csproj
```

Comportamento de startup da API:

- `Development`: se `Cors__AllowedOrigins` não estiver configurada, usa fallback local seguro (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:4173`, `http://127.0.0.1:4173`).
- `Production`: falha na inicialização se `Cors__AllowedOrigins` não estiver configurada.
- Migrações automáticas:
  - padrão `true` em `Development`;
  - padrão `false` em `Production` e demais ambientes;
  - pode ser forçado por `Database__ApplyMigrationsOnStartup=true|false`.

### Frontend

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Testes

- Backend: `cd backend && dotnet test BellaDesignHub.sln`
- Frontend: `cd frontend && npm run test`

## Docker Compose

```bash
cd infra
docker compose up --build
```

Serviços:

- API: `http://localhost:8080`
- Frontend: `http://localhost:4173`
- Postgres: `localhost:5432` (`postgres` / `postgres`)

## Variáveis de ambiente

| Variável | Contexto | Exemplo |
|----------|----------|---------|
| `ConnectionStrings__DefaultConnection` | API | `Host=postgres;Port=5432;Database=bella_design_hub;Username=postgres;Password=postgres` |
| `Cors__AllowedOrigins` | API | `http://localhost:4173;http://localhost:5173` |
| `Database__ApplyMigrationsOnStartup` | API | `false` (produção) / `true` (desenvolvimento) |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8080` |
| `BELLAHUB_BACKEND_IMAGE` | Docker Compose | `usuario/bella-design-hub-backend:latest` |
| `BELLAHUB_FRONT_IMAGE` | Docker Compose | `usuario/bella-design-hub-frontend:latest` |

## CI/CD

Workflows no GitHub Actions:

- `backend-ci.yml`: restore, build, testes com cobertura e publish da imagem backend.
- `frontend-ci.yml`: lint, build, testes e publish da imagem frontend.
