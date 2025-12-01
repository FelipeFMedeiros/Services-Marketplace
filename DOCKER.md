# 🐳 Guia Docker - Services Marketplace

Este guia explica como usar Docker neste projeto.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Extensão Docker do VS Code instalada

## 🏗️ Estrutura dos Containers

O projeto usa 4 containers principais:

1. **mysql**: Banco de dados MySQL 8.0
2. **redis**: Cache Redis 7
3. **elasticsearch**: Motor de busca Elasticsearch 8.11
4. **backend**: API Node.js + Express

## 🚀 Comandos Básicos

### Iniciar todos os serviços
```bash
docker-compose up -d
```
> `-d` significa "detached mode" (roda em background)

### Ver logs de todos os serviços
```bash
docker-compose logs -f
```
> `-f` significa "follow" (acompanha em tempo real)

### Ver logs de um serviço específico
```bash
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Parar todos os serviços
```bash
docker-compose down
```

### Parar e remover volumes (CUIDADO: apaga dados do banco!)
```bash
docker-compose down -v
```

### Rebuild do backend após mudanças no Dockerfile
```bash
docker-compose up -d --build backend
```

### Acessar o terminal de um container
```bash
docker exec -it services-marketplace-backend sh
docker exec -it services-marketplace-mysql bash
```

## 🔧 Configuração do Prisma com Docker

### Rodar migrations
```bash
docker exec -it services-marketplace-backend npx prisma migrate dev --name nome_da_migration
```

### Gerar Prisma Client
```bash
docker exec -it services-marketplace-backend npx prisma generate
```

### Abrir Prisma Studio
```bash
docker exec -it services-marketplace-backend npm run studio
```
> Acesse em: http://localhost:5555

## 🌐 Portas Expostas

- **3000**: Backend API
- **3306**: MySQL
- **6379**: Redis
- **9200**: Elasticsearch HTTP
- **9300**: Elasticsearch Transport

## 📊 Verificar Status dos Serviços

### Ver containers rodando
```bash
docker ps
```

### Ver todos os containers (incluindo parados)
```bash
docker ps -a
```

### Healthcheck dos serviços
```bash
# MySQL
docker exec services-marketplace-mysql mysqladmin ping -h localhost

# Redis
docker exec services-marketplace-redis redis-cli ping

# Elasticsearch
curl http://localhost:9200/_cluster/health
```

## 🐛 Troubleshooting

### Container não inicia
```bash
# Ver logs do container
docker-compose logs backend

# Rebuild forçado
docker-compose up -d --build --force-recreate backend
```

### Limpar tudo e começar do zero
```bash
# Para todos containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove imagens
docker-compose down --rmi all

# Rebuild tudo
docker-compose up -d --build
```

### MySQL não aceita conexão
```bash
# Verificar se está rodando
docker exec services-marketplace-mysql mysqladmin ping -h localhost

# Acessar MySQL
docker exec -it services-marketplace-mysql mysql -u root -p
# Senha: admin
```

## 💡 Dicas

1. **Desenvolvimento Local**: Os arquivos do backend são sincronizados automaticamente (volume mounting)
2. **Hot Reload**: O nodemon detecta mudanças automaticamente
3. **Dados Persistentes**: MySQL, Redis e Elasticsearch usam volumes para persistir dados
4. **Networks**: Todos os containers estão na mesma rede e podem se comunicar pelos nomes

## 🔄 Workflow de Desenvolvimento

1. Inicie os serviços:
   ```bash
   docker-compose up -d
   ```

2. Veja os logs:
   ```bash
   docker-compose logs -f backend
   ```

3. Faça suas alterações no código (o nodemon reinicia automaticamente)

4. Quando terminar:
   ```bash
   docker-compose down
   ```

## 📝 Notas Importantes

- O arquivo `.env` não é copiado para o container (use variáveis no docker-compose.yml)
- Para produção, crie um `docker-compose.prod.yml` separado
- Os volumes mantêm os dados mesmo após `docker-compose down`
- Use `docker-compose down -v` apenas se quiser apagar TUDO
