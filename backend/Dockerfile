# Dockerfile para o Backend do Services Marketplace
# Estágio de desenvolvimento

FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Expor a porta
EXPOSE 3000

# Comando para desenvolvimento
# O prisma generate será executado quando o container iniciar
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
