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
git clone https://github.com/seu-usuario/eventos-api.git
cd eventos-api
```

2. Configure as variáveis de ambiente:
   - Copie o arquivo `appsettings.Development.json` para criar seu próprio arquivo de configuração local
   - Ajuste as configurações conforme necessário (conexão com banco de dados, chaves JWT, etc.)

3. Execute com Docker:
```bash
docker-compose up -d
```

Ou execute localmente:
```bash
dotnet restore
dotnet run --project EventosAPI.API
```

## 📖 Documentação da API

A documentação da API está disponível através do Swagger UI em:
- Desenvolvimento: https://localhost:5001/swagger
- Produção: https://seu-dominio/swagger

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
