# Eventos API

API RESTful para gerenciamento de eventos e ingressos, desenvolvida com ASP.NET Core 8.0.

## 🚀 Tecnologias

- ASP.NET Core 8.0
- Entity Framework Core
- MySQL
- Docker
- JWT Authentication
- Swagger/OpenAPI
- FluentValidation
- AutoMapper
- Serilog

## 📋 Pré-requisitos

- .NET SDK 8.0
- Docker e Docker Compose
- Visual Studio Code ou Visual Studio 2022

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JoaoVictor-C/Site-eventos-SENAI.git
cd Site-eventos-SENAI
```

2. Execute com Docker (recomendado para desenvolvimento):
   - Copie `.env.example` (na raiz do repositório) para `.env` e preencha os valores:
     - `MYSQL_ROOT_PASSWORD`
     - `JWT_KEY`
```bash
docker-compose up -d
```

3. Execute localmente (sem Docker):
   - Configure segredos locais (User Secrets) no projeto `Backend/EventosAPI.API`:
```bash
cd Backend/EventosAPI.API
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "coloque-uma-chave-longa-e-aleatoria"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=eventos_db;User=root;Password=SUA_SENHA;"
cd ../..

dotnet restore
dotnet run --project Backend/EventosAPI.API
```

## 📖 Documentação da API

A documentação da API está disponível através do Swagger UI em:
- Docker: http://localhost:5027/swagger
- Execução local (Kestrel): https://localhost:5001/swagger

## 🛠️ Estrutura do Projeto

- `EventosAPI.API`: Camada de apresentação (Controllers, Middleware, Filters)
- `EventosAPI.Application`: Camada de aplicação (Services, DTOs, Validators)
- `EventosAPI.Domain`: Camada de domínio (Entities, Interfaces)
- `EventosAPI.Infrastructure`: Camada de infraestrutura (Repositories, DbContext)

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login através do endpoint `/api/v1/auth/login`
2. Use o token retornado no header `Authorization: Bearer {token}`

## 👥 Papéis de Usuário

- `Admin`: Acesso total ao sistema
- `Organizer`: Pode criar e gerenciar eventos
- `User`: Pode visualizar eventos e gerenciar seus ingressos

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
