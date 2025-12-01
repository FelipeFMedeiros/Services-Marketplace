# Testando Upload de Fotos

## Fase 5: Service Photos com Cloudinary

### 1. Upload de Foto (multipart/form-data)

```bash
# Upload de foto para um serviço
curl -X POST http://localhost:3000/api/services/1/photos \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI" \
  -F "image=@caminho/para/sua/imagem.jpg" \
  -F "isCover=true"
```

**Resposta esperada:**
```json
{
  "message": "Foto enviada com sucesso",
  "photo": {
    "id": 1,
    "service_id": 1,
    "url": "https://res.cloudinary.com/defsqk3jc/image/upload/v1234567890/Service-Marketplace/abc123.jpg",
    "is_cover": true,
    "created_at": "2025-12-01T08:00:00.000Z",
    "cloudinary_public_id": "Service-Marketplace/abc123"
  }
}
```

### 2. Definir Foto de Capa

```bash
# Marcar uma foto existente como capa
curl -X PUT http://localhost:3000/api/services/1/photos/2/cover \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"
```

**Resposta esperada:**
```json
{
  "message": "Foto de capa atualizada com sucesso",
  "photo": {
    "id": 2,
    "service_id": 1,
    "url": "https://res.cloudinary.com/defsqk3jc/image/upload/v1234567890/Service-Marketplace/xyz789.jpg",
    "is_cover": true,
    "created_at": "2025-12-01T08:05:00.000Z"
  }
}
```

### 3. Deletar Foto

```bash
# Deletar foto do serviço e do Cloudinary
curl -X DELETE http://localhost:3000/api/services/1/photos/2 \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"
```

**Resposta esperada:**
```json
{
  "message": "Foto deletada com sucesso"
}
```

## Características da Implementação

### Upload
- **Formato:** `multipart/form-data` (arquivo binário)
- **Tipos aceitos:** JPEG, PNG, WEBP, GIF
- **Tamanho máximo:** 5MB
- **Processamento Cloudinary:**
  - Tamanho máximo: 1200x800px (proporcional)
  - Qualidade: automática
  - Formato: automático (webp quando possível)
- **Armazenamento temporário:** `/backend/uploads` (deletado após upload)

### Segurança
- Autenticação obrigatória (JWT cookie)
- Apenas PROVIDER pode fazer upload
- Apenas dono do serviço pode gerenciar fotos
- Rate limiting: 20 requisições/minuto

### Validações
- Arquivo obrigatório
- Tipo de arquivo validado
- Tamanho limitado a 5MB
- Foto deve pertencer ao serviço correto
- Provider deve ser dono do serviço

### Organização do Código
- **Controller:** `src/controllers/servicePhotoController.ts`
- **Middleware:** `src/middleware/upload.ts` (multer config)
- **Routes:** `src/routes/services.ts` (seção Service Photos)
- **Config:** `src/config/cloudinary.ts`

## Testando via Postman/Insomnia

1. **Selecione:** POST `/api/services/:id/photos`
2. **Headers:** Cookie com token de autenticação
3. **Body:** 
   - Tipo: `form-data`
   - Campo `image`: selecione um arquivo de imagem
   - Campo `isCover`: true/false (opcional)
4. **Enviar**

## Integração com Frontend

```javascript
// Exemplo React com Fetch API
const uploadPhoto = async (serviceId, file, isCover = false) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('isCover', isCover);

  const response = await fetch(`/api/services/${serviceId}/photos`, {
    method: 'POST',
    credentials: 'include', // Para enviar cookies
    body: formData
    // NÃO adicionar Content-Type, o browser faz automaticamente
  });

  return await response.json();
};

// Uso em um componente
<input 
  type="file" 
  accept="image/jpeg,image/png,image/webp,image/gif"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      uploadPhoto(serviceId, file, true);
    }
  }}
/>
```
