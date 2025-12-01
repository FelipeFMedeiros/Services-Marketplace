# 📚 Documentação da API

A API possui documentação automática em duas interfaces diferentes:

## 🔗 Links de Acesso:

### **Scalar (Recomendado)** - Interface Moderna
🌐 **http://localhost:3000/docs**
- Interface bonita e intuitiva
- Tema roxo customizado
- Melhor para testar endpoints
- Suporte a cookies automático

### **Swagger UI** - Interface Clássica
🌐 **http://localhost:3000/api-docs**
- Interface tradicional do Swagger
- Boa para documentação formal
- Exportar coleções Postman

### **JSON Spec** - OpenAPI 3.0
🌐 **http://localhost:3000/api-docs.json**
- Especificação OpenAPI em JSON
- Importar em Postman/Insomnia
- Gerar código client

---

## 🧪 Testando as Rotas de Autenticação:

### 1️⃣ **Registrar Novo Usuário**
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Teste Usuario",
  "email": "teste@email.com",
  "password": "senha123",
  "phone": "11987654321",
  "role": "CLIENT"
}
```

### 2️⃣ **Fazer Login**
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "maria@exemplo.com",
  "password": "senha123"
}
```
**Resposta:** Token JWT enviado em httpOnly cookie

### 3️⃣ **Obter Usuário Atual**
```
GET /api/auth/me
```
**Requer:** Cookie de autenticação (enviado automaticamente após login)

### 4️⃣ **Fazer Logout**
```
POST /api/auth/logout
```

---

## 👥 Usuários de Teste:

### Admin:
- Email: `admin@marketplace.com`
- Senha: `admin123`

### Prestador:
- Email: `maria@exemplo.com`
- Senha: `senha123`

### Cliente:
- Email: `joao@exemplo.com`
- Senha: `senha123`

---

## 💡 Dicas de Uso:

### No Scalar:
1. Acesse http://localhost:3000/docs
2. Clique no endpoint que deseja testar
3. Preencha os campos do body
4. Clique em "Send Request"
5. O cookie é gerenciado automaticamente!

### No Swagger:
1. Acesse http://localhost:3000/api-docs
2. Clique em "Try it out"
3. Preencha os dados
4. Clique em "Execute"

### No Postman/Insomnia:
1. Importe a spec: http://localhost:3000/api-docs.json
2. Configure para aceitar cookies
3. Teste as rotas normalmente

---

## 🔒 Autenticação:

A API usa **JWT em httpOnly cookies**:
- ✅ Seguro contra XSS
- ✅ Enviado automaticamente em cada requisição
- ✅ Não precisa adicionar header Authorization
- ✅ Gerenciado pelo navegador/cliente

---

## 🛡️ Rate Limiting:

A API implementa **Rate Limiting com Redis (Token Bucket)** para proteção contra abusos:

### Limites por Rota:

| Rota | Limite | Janela | Descrição |
|------|--------|--------|-----------|
| POST /api/auth/register | 10 req | 1 min | Registro de usuários |
| POST /api/auth/login | 10 req | 1 min | Login |
| POST /api/auth/logout | 10 req | 1 min | Logout |
| GET /api/auth/me | 25 req | 1 min | Dados do usuário |

### Headers de Rate Limit:

Todas as respostas incluem headers informativos:
```
X-RateLimit-Limit: 10          // Limite máximo
X-RateLimit-Remaining: 7       // Requisições restantes
X-RateLimit-Reset: 1638360000  // Timestamp do reset
```

### Quando Exceder o Limite:

**Status Code:** `429 Too Many Requests`

**Resposta:**
```json
{
  "success": false,
  "message": "Muitas tentativas de autenticação. Tente novamente em 1 minuto.",
  "retryAfter": 60
}
```

### Tecnologia:
- **express-rate-limit** - Middleware de rate limiting
- **rate-limit-redis** - Store Redis para limites distribuídos
- **Token Bucket Algorithm** - Algoritmo justo e eficiente

---

## 📝 Adicionando Nova Documentação:

Ao criar novas rotas, adicione comentários JSDoc:

```typescript
/**
 * @openapi
 * /api/endpoint:
 *   post:
 *     tags:
 *       - Tag Name
 *     summary: Breve descrição
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.post('/endpoint', controller);
```

A documentação é gerada automaticamente ao reiniciar o servidor!
