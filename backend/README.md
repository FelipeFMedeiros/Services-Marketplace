# Services Marketplace API

API RESTful para marketplace de serviços desenvolvida em Node.js com TypeScript e Express.

## 🚀 Tecnologias

- **Node.js** v22.16.0
- **TypeScript** v5.9.3
- **Express** v5.1.0
- **CORS** v2.8.5
- **Helmet** (Segurança)
- **Morgan** (Logging)
- **dotenv** (Variáveis de ambiente)

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   
4. Edite o arquivo `.env` com suas configurações

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm run build` - Compila o projeto TypeScript para JavaScript
- `npm run start` - Inicia o servidor em modo produção
- `npm test` - Executa os testes (ainda não implementado)

## 🏗️ Estrutura do Projeto

```
src/
├── controllers/     # Controladores da aplicação
├── middleware/      # Middlewares customizados
├── routes/          # Definição das rotas
└── index.ts         # Arquivo principal da aplicação
```

## 🌐 Endpoints

### Health Check
- **GET** `/health` - Verifica o status da aplicação

### API
- **GET** `/api` - Informações da API
- **GET** `/docs` - Documentação da API

## 🔧 Desenvolvimento

Para iniciar o servidor em modo desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🚀 Produção

1. Compile o projeto:
   ```bash
   npm run build
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| PORT | Porta do servidor | 3000 |
| NODE_ENV | Ambiente de execução | development |
| DB_HOST | Host do banco de dados | localhost |
| DB_PORT | Porta do banco de dados | 3306 |
| DB_USER | Usuário do banco de dados | root |
| DB_PASSWORD | Senha do banco de dados | admin |
| DB_NAME | Nome do banco de dados | services_marketplace |
| JWT_SECRET | Chave secreta do JWT | - |
| FRONTEND_URL | URL do frontend | http://localhost:3000 |