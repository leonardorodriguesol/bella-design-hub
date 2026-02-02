# Bela Design Hub

Aplicação para gestão da marcenaria Bela Design, concentrando clientes, pedidos/encomendas e controle de gastos em um único hub.

## Visão geral

- **Stack backend:** .NET 8 (ASP.NET Core Web API), EF Core + PostgreSQL, autenticação JWT.
- **Stack frontend:** React + Vite (TypeScript), UI kit (Chakra/Mantine), Zustand/Redux para estado.
- **Infra:** Docker Compose para orquestrar API, frontend e banco; GitHub Actions para CI.

## Estrutura do repositório

```
backend/   -> API .NET (camadas Domain/Application/Infrastructure/Api)
frontend/  -> SPA React (Vite, TypeScript)
infra/     -> Docker, scripts e configs compartilhadas
```

## Backend (API .NET)

Pré-requisitos: [.NET SDK 8.0](https://aka.ms/dotnet-download) e PostgreSQL local (ou Docker).

```bash
cd backend
dotnet restore
dotnet ef database update   # aplica migração InitialCreate
dotnet run --project BelaDesignHub.Api/BelaDesignHub.Api.csproj
```

O `appsettings.json` já define a connection string padrão (localhost). Para ambientes diferentes, sobrescreva via variável `ConnectionStrings__DefaultConnection`.

## Infra local (Docker Compose)

Por enquanto, o Compose sobe apenas o banco Postgres (a API roda via `dotnet run`).

```bash
cd infra
docker compose up --build
```

- Postgres exposto em `localhost:5432` (user/password: `postgres`)
- Configure sua API para usar `Host=localhost;Port=5432;Database=bela_design_hub;Username=postgres;Password=postgres`

## Funcionalidades atuais

- **Clientes**: CRUD completo com validação básica e timestamps.
- **Pedidos/Vendas**: cadastro com itens, cálculo de valor total, filtros por cliente/status/período e atualização de status.
- **Gastos**: registro de despesas com categoria, data e notas, além de listagem filtrada por período/categoria.

Endpoints expostos em `http://localhost:5034/swagger` quando a API está em execução.

## Testes automatizados

```bash
cd backend
dotnet test
```

Os testes utilizam `WebApplicationFactory` e banco em memória para validar os principais endpoints de clientes, pedidos e gastos.

## Próximos passos

1. Adicionar autenticação/autorizações básicas na API.
2. Criar SPA com Vite + autenticação básica e tela de clientes/pedidos.
3. Construir relatórios/dashboards (controle financeiro e pipeline de pedidos).
4. Automatizar CI/CD (lint, testes e build de imagens Docker).