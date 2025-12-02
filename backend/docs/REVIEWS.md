# 📝 Sistema de Avaliações (Reviews)

## Visão Geral

O sistema de avaliações permite que **clientes** avaliem serviços após a conclusão de agendamentos. Cada avaliação contém:
- **Rating**: Nota de 1 a 5 estrelas (obrigatório)
- **Comentário**: Texto descritivo de 10 a 500 caracteres (opcional)

### Regras de Negócio

1. ✅ **Apenas clientes (CLIENT)** podem criar avaliações
2. ✅ **Apenas agendamentos COMPLETED** podem ser avaliados
3. ✅ **1 avaliação por agendamento** (não permite duplicatas)
4. ✅ Cliente só pode avaliar seus próprios agendamentos
5. ✅ Cliente só pode editar/deletar suas próprias avaliações
6. ✅ Avaliações são **públicas** para visualização

---

## 📋 Endpoints

### 1. Criar Avaliação

**POST** `/api/reviews`

**Autenticação**: CLIENT apenas

**Request Body**:
```json
{
  "bookingId": 1,
  "rating": 5,
  "comment": "Excelente serviço! Muito atencioso e caprichoso. Recomendo!"
}
```

**Validações**:
- `bookingId`: obrigatório (integer)
- `rating`: obrigatório, 1-5 (integer)
- `comment`: opcional, 10-500 caracteres (string)
- Booking deve estar COMPLETED
- Booking deve pertencer ao cliente autenticado
- Não pode existir avaliação prévia para este booking

**Response 201**:
```json
{
  "message": "Avaliação criada com sucesso",
  "review": {
    "id": 1,
    "booking_id": 1,
    "service_id": 5,
    "client_id": 2,
    "rating": 5,
    "comment": "Excelente serviço! Muito atencioso e caprichoso. Recomendo!",
    "created_at": "2025-12-01T14:30:00.000Z",
    "client": {
      "id": 2,
      "name": "Maria Silva"
    },
    "service": {
      "id": 5,
      "title": "Corte de Cabelo Masculino"
    },
    "booking": {
      "id": 1,
      "start_datetime": "2025-11-30T10:00:00.000Z",
      "end_datetime": "2025-11-30T11:00:00.000Z"
    }
  }
}
```

**Erros**:
- `400`: Dados inválidos, booking não COMPLETED, ou já existe avaliação
- `401`: Não autenticado
- `403`: Não autorizado (não é CLIENT ou não é dono do booking)
- `404`: Agendamento não encontrado

---

### 2. Listar Minhas Avaliações

**GET** `/api/reviews/my`

**Autenticação**: CLIENT apenas

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)

**Response 200**:
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excelente serviço!",
      "created_at": "2025-12-01T14:30:00.000Z",
      "service": {
        "id": 5,
        "title": "Corte de Cabelo Masculino",
        "provider": {
          "id": 1,
          "user": {
            "name": "João Barbeiro"
          }
        }
      },
      "booking": {
        "id": 1,
        "start_datetime": "2025-11-30T10:00:00.000Z",
        "end_datetime": "2025-11-30T11:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 3. Listar Avaliações de um Serviço

**GET** `/api/reviews/service/:serviceId`

**Autenticação**: Não requerida (rota pública)

**Query Parameters**:
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20, máximo: 100)
- `minRating`: filtrar por rating mínimo (1-5)
- `maxRating`: filtrar por rating máximo (1-5)

**Exemplo**: `GET /api/reviews/service/5?page=1&limit=10&minRating=4`

**Response 200**:
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excelente serviço!",
      "created_at": "2025-12-01T14:30:00.000Z",
      "client": {
        "id": 2,
        "name": "Maria Silva"
      },
      "booking": {
        "id": 1,
        "start_datetime": "2025-11-30T10:00:00.000Z"
      }
    },
    {
      "id": 2,
      "rating": 4,
      "comment": "Muito bom, mas poderia ser mais rápido.",
      "created_at": "2025-11-29T16:20:00.000Z",
      "client": {
        "id": 3,
        "name": "Carlos Santos"
      },
      "booking": {
        "id": 2,
        "start_datetime": "2025-11-28T15:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "statistics": {
    "averageRating": 4.5,
    "totalReviews": 42,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 5,
      "4": 12,
      "5": 20
    }
  }
}
```

**Estatísticas**:
- `averageRating`: Média aritmética de todas as avaliações (0-5)
- `totalReviews`: Total de avaliações do serviço
- `ratingDistribution`: Contagem de avaliações por estrela

---

### 4. Buscar Avaliação por ID

**GET** `/api/reviews/:id`

**Autenticação**: Não requerida (rota pública)

**Response 200**:
```json
{
  "id": 1,
  "rating": 5,
  "comment": "Excelente serviço!",
  "created_at": "2025-12-01T14:30:00.000Z",
  "client": {
    "id": 2,
    "name": "Maria Silva"
  },
  "service": {
    "id": 5,
    "title": "Corte de Cabelo Masculino",
    "provider": {
      "id": 1,
      "user": {
        "name": "João Barbeiro"
      }
    }
  },
  "booking": {
    "id": 1,
    "start_datetime": "2025-11-30T10:00:00.000Z",
    "end_datetime": "2025-11-30T11:00:00.000Z",
    "status": "COMPLETED"
  }
}
```

**Erros**:
- `404`: Avaliação não encontrada

---

### 5. Atualizar Avaliação

**PUT** `/api/reviews/:id`

**Autenticação**: CLIENT apenas (dono da avaliação)

**Request Body** (todos os campos opcionais):
```json
{
  "rating": 4,
  "comment": "Serviço muito bom, mas poderia ser mais rápido."
}
```

**Validações**:
- `rating`: se fornecido, deve ser 1-5 (integer)
- `comment`: se fornecido, deve ter 10-500 caracteres (string)
- Apenas o cliente dono da avaliação pode atualizar

**Response 200**:
```json
{
  "message": "Avaliação atualizada com sucesso",
  "review": {
    "id": 1,
    "rating": 4,
    "comment": "Serviço muito bom, mas poderia ser mais rápido.",
    "created_at": "2025-12-01T14:30:00.000Z",
    "client": {
      "id": 2,
      "name": "Maria Silva"
    },
    "service": {
      "id": 5,
      "title": "Corte de Cabelo Masculino"
    },
    "booking": {
      "id": 1,
      "start_datetime": "2025-11-30T10:00:00.000Z"
    }
  }
}
```

**Erros**:
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Não autorizado (não é o dono)
- `404`: Avaliação não encontrada

---

### 6. Deletar Avaliação

**DELETE** `/api/reviews/:id`

**Autenticação**: CLIENT apenas (dono da avaliação)

**Response 200**:
```json
{
  "message": "Avaliação deletada com sucesso"
}
```

**Erros**:
- `401`: Não autenticado
- `403`: Não autorizado (não é o dono)
- `404`: Avaliação não encontrada

---

## 🔄 Integração com Outros Endpoints

### GET `/api/services/:id`

O endpoint de detalhes do serviço agora retorna:

```json
{
  "id": 5,
  "title": "Corte de Cabelo Masculino",
  "description": "...",
  "provider": { ... },
  "variations": [ ... ],
  "photos": [ ... ],
  "reviews": [
    // Últimas 5 avaliações
  ],
  "_count": {
    "bookings": 50,
    "reviews": 42
  },
  "reviewStatistics": {
    "averageRating": 4.5,
    "totalReviews": 42,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 5,
      "4": 12,
      "5": 20
    }
  }
}
```

**Dados Incluídos**:
- `reviews`: Últimas 5 avaliações (ordenadas por data decrescente)
- `_count.reviews`: Total de avaliações
- `reviewStatistics`: Estatísticas completas de avaliação

---

## 📊 Casos de Uso

### 1. Cliente Avalia Serviço Após Conclusão

**Fluxo**:
1. Cliente completa agendamento (status = COMPLETED)
2. Cliente acessa `POST /api/reviews`
3. Fornece `bookingId`, `rating`, e opcionalmente `comment`
4. Sistema valida e cria avaliação
5. Estatísticas do serviço são atualizadas automaticamente

### 2. Cliente Visualiza Suas Avaliações

**Fluxo**:
1. Cliente autenticado acessa `GET /api/reviews/my`
2. Sistema retorna todas as avaliações do cliente com paginação
3. Cada avaliação inclui detalhes do serviço e booking relacionado

### 3. Visitante Navega Avaliações de um Serviço

**Fluxo**:
1. Visitante (não autenticado) acessa `GET /api/reviews/service/5`
2. Sistema retorna avaliações paginadas + estatísticas
3. Pode filtrar por `minRating` ou `maxRating`
4. Estatísticas mostram média e distribuição de estrelas

### 4. Cliente Edita Avaliação

**Fluxo**:
1. Cliente acessa `PUT /api/reviews/1`
2. Atualiza `rating` e/ou `comment`
3. Sistema valida ownership e atualiza
4. Estatísticas do serviço são recalculadas

### 5. Cliente Remove Avaliação

**Fluxo**:
1. Cliente acessa `DELETE /api/reviews/1`
2. Sistema valida ownership e remove permanentemente
3. Estatísticas do serviço são recalculadas

---

## ⚠️ Validações e Restrições

### Rating
- ✅ Obrigatório na criação
- ✅ Deve ser número inteiro
- ✅ Valor entre 1 e 5 (inclusive)

### Comentário
- ✅ Opcional
- ✅ Se fornecido, mínimo 10 caracteres
- ✅ Se fornecido, máximo 500 caracteres
- ✅ Tipo string

### Booking
- ✅ Deve existir no banco de dados
- ✅ Deve pertencer ao cliente autenticado
- ✅ Deve estar no status COMPLETED
- ✅ Não pode ter avaliação prévia (1 review/booking)

### Permissões
- ✅ Criar: apenas CLIENT
- ✅ Editar: apenas CLIENT dono da avaliação
- ✅ Deletar: apenas CLIENT dono da avaliação
- ✅ Visualizar: público (qualquer pessoa)

---

## 🎯 Dicas para o Frontend

### Exibir Estrelas
```javascript
const renderStars = (rating) => {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
};

console.log(renderStars(4)); // ⭐⭐⭐⭐☆
```

### Verificar se Pode Avaliar
```javascript
const canReview = (booking) => {
  return booking.status === 'COMPLETED' && !booking.review;
};
```

### Calcular Porcentagem de Distribuição
```javascript
const getPercentages = (distribution, total) => {
  return {
    5: ((distribution[5] / total) * 100).toFixed(1) + '%',
    4: ((distribution[4] / total) * 100).toFixed(1) + '%',
    3: ((distribution[3] / total) * 100).toFixed(1) + '%',
    2: ((distribution[2] / total) * 100).toFixed(1) + '%',
    1: ((distribution[1] / total) * 100).toFixed(1) + '%'
  };
};
```

### Formatar Data da Avaliação
```javascript
const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR');
};
```

### Validar Formulário de Avaliação
```javascript
const validateReview = (rating, comment) => {
  const errors = {};
  
  if (!rating) {
    errors.rating = 'Avaliação é obrigatória';
  } else if (rating < 1 || rating > 5) {
    errors.rating = 'Avaliação deve ser entre 1 e 5 estrelas';
  }
  
  if (comment && comment.length < 10) {
    errors.comment = 'Comentário deve ter no mínimo 10 caracteres';
  }
  
  if (comment && comment.length > 500) {
    errors.comment = 'Comentário deve ter no máximo 500 caracteres';
  }
  
  return errors;
};
```

---

## 📈 Métricas e Análises

### Rating Médio
Calculado pela média aritmética:
```
averageRating = Σ(rating × count) / totalReviews
```

Exemplo:
- 20 reviews de 5 estrelas
- 12 reviews de 4 estrelas
- 5 reviews de 3 estrelas
- 3 reviews de 2 estrelas
- 2 reviews de 1 estrela

```
averageRating = (20×5 + 12×4 + 5×3 + 3×2 + 2×1) / 42
              = (100 + 48 + 15 + 6 + 2) / 42
              = 171 / 42
              = 4.07
```

### Distribuição de Estrelas
Mostra a contagem absoluta de avaliações por rating:
```json
{
  "1": 2,
  "2": 3,
  "3": 5,
  "4": 12,
  "5": 20
}
```

---

## 🔐 Segurança

1. **Autenticação via JWT**: Cookie httpOnly obrigatório para CLIENT
2. **Validação de Ownership**: Cliente só pode criar/editar/deletar suas próprias avaliações
3. **Validação de Status**: Apenas bookings COMPLETED podem ser avaliados
4. **Rate Limiting**: Proteção contra spam de avaliações
5. **Sanitização**: Validação de tamanho e tipo de dados

---

## ✅ Checklist de Implementação

- [x] reviewController.ts criado com todas as funções
- [x] routes/reviews.ts criado com OpenAPI documentation
- [x] routes/index.ts atualizado com rota de reviews
- [x] serviceController.ts atualizado para incluir reviews e estatísticas
- [x] Validações implementadas (rating 1-5, comment 10-500)
- [x] Permissões configuradas (CLIENT apenas para criar/editar/deletar)
- [x] Rotas públicas para visualização
- [x] Paginação implementada
- [x] Estatísticas de rating calculadas automaticamente
- [x] Documentação completa (REVIEWS.md)

---

## 🚀 Próximos Passos

A FASE 10 está **COMPLETA**! Sistema de avaliações totalmente funcional com:
- ✅ 6 endpoints (criar, listar minhas, listar do serviço, detalhes, atualizar, deletar)
- ✅ Validações robustas
- ✅ Estatísticas automáticas (média + distribuição)
- ✅ Integração com endpoint de serviços
- ✅ Documentação OpenAPI completa
- ✅ Permissões e segurança implementadas

**Teste os endpoints** no Swagger/Scalar em `http://localhost:3000/api-docs` ou `http://localhost:3000/docs`!
