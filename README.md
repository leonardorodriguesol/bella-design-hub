# Bela Design Hub

Sistema completo para a marcenaria Bella Design centralizar o relacionamento com clientes, acompanhar pedidos e controlar despesas do negócio em um único painel. O projeto reúne uma API em .NET 8, uma SPA React e infraestrutura pronta para rodar em containers.

## Principais recursos

- **Cadastro de clientes** com busca e atualização rápida.
- **Pedidos** com itens, totais automáticos, filtros por status/cliente e acompanhamento de produção.
- **Produção** com catálogo de produtos (peças/insumos), planejamento diário, atualização de status e cálculo automático das peças necessárias.
- **Despesas operacionais** com categorias e notas para manter a saúde financeira em dia.
- **Dashboard web** pensado para uso diário na operação da marcenaria.

## Arquitetura em alto nível

| Camada     | Stack principal | Descrição |
|------------|-----------------|-----------|
| Backend    | ASP.NET Core 8 + EF Core + PostgreSQL | API REST responsável por clientes, pedidos, itens, despesas e produção (produtos/planejamento). Inclui migrações automáticas e política de CORS configurável via variável `Cors__AllowedOrigins`. |
| Frontend   | React + Vite + TypeScript + React Query + Tailwind CSS | Interface SPA que consome a API, com filtros avançados e feedback em tempo real. |
| Infra      | Docker Compose + GitHub Actions | Orquestra Postgres, API e frontend; pipelines de CI constroem/testam e publicam as imagens Docker. |

Estrutura do repositório:

```
backend/   -> API .NET (Domain, Application, Infrastructure, Api)
frontend/  -> SPA React (Vite + TypeScript)
infra/     -> Docker Compose, scripts SQL e demais utilitários
```

## Como rodar localmente

### Pré-requisitos

- .NET SDK 8.0
- Node.js 20+ e npm
- Docker (opcional, para rodar tudo em containers)

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update          # aplica migrações
dotnet run --project BelaDesignHub.Api/BelaDesignHub.Api.csproj
```

A connection string padrão aponta para `localhost`. Para usar outro host (ex.: Docker), sobrescreva `ConnectionStrings__DefaultConnection`.

### Frontend

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Backend

- **Stack**: ASP.NET Core 8 com Entity Framework Core e PostgreSQL, seguindo camadas Domain/Application/Infrastructure/Api.
- **Domínios**: clientes, pedidos com itens e status, despesas com categorias e datas, produtos com peças e agendas de produção.
- **Infra de dados**: migrações automáticas, seeding via `infra/sql/seed-data.sql`, connection string configurável por `ConnectionStrings__DefaultConnection`.
- **CORS e config**: variável `Cors__AllowedOrigins` obrigatória, health checks e Swagger habilitados em desenvolvimento.
- **Testes**: `dotnet test` cobre domínio, aplicação, infraestrutura e API usando `WebApplicationFactory` com banco em memória.

## Frontend

- **Stack**: React 18 + Vite, TypeScript, React Router DOM, React Query, React Hook Form + Zod e Tailwind CSS.
- **Páginas**: Home com branding Bella Design, Dashboard financeiro, módulo de Clientes com busca, Pedidos com filtros combinados, Despesas e Produção (catálogo sob demanda + planejamento diário com filtros e atualização de status).
- **UX**: filtros colapsáveis, mensagens amigáveis sem jargões técnicos, tratamento específico para falhas de conexão e layout responsivo.
- **Testes**: Vitest + React Testing Library com utilitários em `frontend/tests`; MSW planejado para mocks de API.
- **Build/Docker**: multi-stage Dockerfile (`frontend/Dockerfile`) gera bundle servido por Nginx; `VITE_API_BASE_URL` define o endpoint da API.

## Testes

- **Backend:** `cd backend && dotnet test`
- **Frontend:** `cd frontend && npm run test`

Os testes do backend usam `WebApplicationFactory` com banco em memória; no frontend utilizamos Vitest + React Testing Library.

## Executar tudo com Docker Compose

```bash
cd infra
docker compose up --build
```

Serviços expostos:

- API em `http://localhost:8080`
- Frontend em `http://localhost:4173`
- Postgres em `localhost:5432` (`postgres` / `postgres`)

O Compose também provisiona o banco com o script `infra/sql/seed-data.sql`.

## Variáveis de ambiente importantes

| Variável | Onde usar | Exemplo |
|----------|-----------|---------|
| `ConnectionStrings__DefaultConnection` | API | `Host=postgres;Port=5432;Database=bela_design_hub;Username=postgres;Password=postgres` |
| `Cors__AllowedOrigins` | API | `http://localhost:4173` ou múltiplos valores separados por `;` |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:8080` |

## CI/CD

O repositório possui workflows no GitHub Actions para backend e frontend, garantindo restauração, build, testes e publicação das imagens Docker `leonardodfg12/bela-design-hub-backend` e `leonardodfg12/bela-design-hub-frontend`.