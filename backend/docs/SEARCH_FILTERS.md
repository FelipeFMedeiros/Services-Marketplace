# 🔍 FASE 7: Sistema de Busca e Filtros

## 📋 Resumo

Sistema avançado de busca e filtros para navegação de clientes no marketplace.

---

## 🎯 Endpoints Implementados

### 1. **GET /api/services** - Busca Avançada de Serviços

**Público** | Melhorado com filtros avançados

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `serviceTypeId` | integer | Filtrar por tipo de serviço | `1` |
| `city` | string | Filtrar por cidade do prestador | `"São Paulo"` |
| `state` | string | Filtrar por estado (UF) | `"SP"` |
| `search` | string | Buscar em nome/descrição | `"corte cabelo"` |
| `minPrice` | float | Preço mínimo (variações) | `50.00` |
| `maxPrice` | float | Preço máximo (variações) | `200.00` |
| `sortBy` | string | Ordenação | `price_asc`, `price_desc`, `recent` |
| `page` | integer | Número da página | `1` |
| `limit` | integer | Itens por página (máx 100) | `20` |

#### Resposta:

```json
{
  "services": [
    {
      "id": 1,
      "title": "Corte de Cabelo Masculino",
      "description": "Corte moderno com acabamento profissional",
      "is_multiday": false,
      "is_active": true,
      "serviceType": {
        "id": 1,
        "name": "Beleza e Estética"
      },
      "provider": {
        "id": 1,
        "city": "São Paulo",
        "state": "SP",
        "user": {
          "id": 2,
          "name": "João Silva"
        }
      },
      "variations": [
        {
          "id": 1,
          "name": "Corte Simples",
          "price": 50.00,
          "duration_minutes": 30
        },
        {
          "id": 2,
          "name": "Corte + Barba",
          "price": 80.00,
          "duration_minutes": 60
        }
      ],
      "photos": [
        {
          "id": 1,
          "url": "https://cloudinary.com/...",
          "is_cover": true
        }
      ],
      "priceRange": {
        "min": 50.00,
        "max": 80.00
      },
      "_count": {
        "variations": 2,
        "bookings": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. **GET /api/providers/search** - Busca de Prestadores

**Público** | Novo endpoint para navegação

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `city` | string | Filtrar por cidade | `"São Paulo"` |
| `state` | string | Filtrar por estado (UF) | `"SP"` |
| `serviceTypeId` | integer | Prestadores que oferecem este tipo | `1` |
| `search` | string | Buscar em nome/bio | `"manicure"` |
| `sortBy` | string | Ordenação | `services_count`, `recent` |
| `page` | integer | Número da página | `1` |
| `limit` | integer | Itens por página (máx 100) | `20` |

#### Resposta:

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": 1,
        "bio": "Profissional com 20 anos de experiência",
        "document": "12345678900",
        "city": "São Paulo",
        "state": "SP",
        "user": {
          "id": 2,
          "name": "João Silva",
          "phone": "11999999999"
        },
        "services": [
          {
            "id": 1,
            "title": "Corte de Cabelo Masculino",
            "description": "Corte moderno...",
            "serviceType": {
              "id": 1,
              "name": "Beleza e Estética"
            },
            "photos": [
              {
                "id": 1,
                "url": "https://cloudinary.com/...",
                "is_cover": true
              }
            ],
            "variations": [
              {
                "id": 1,
                "name": "Corte Simples",
                "price": 50.00,
                "duration_minutes": 30
              }
            ]
          }
        ],
        "_count": {
          "services": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🧪 Exemplos de Uso

### Buscar serviços de manicure em SP, ordenados por preço crescente

```bash
curl "http://localhost:3000/api/services?search=manicure&state=SP&sortBy=price_asc&page=1&limit=10"
```

### Buscar serviços com preço entre R$ 50 e R$ 150

```bash
curl "http://localhost:3000/api/services?minPrice=50&maxPrice=150&sortBy=price_asc"
```

### Buscar prestadores em São Paulo que oferecem serviços de Beleza

```bash
curl "http://localhost:3000/api/providers/search?city=São%20Paulo&serviceTypeId=1&sortBy=services_count"
```

### Buscar prestadores por palavra-chave "profissional"

```bash
curl "http://localhost:3000/api/providers/search?search=profissional&page=1&limit=20"
```

---

## 🎨 Features Implementadas

### Busca de Serviços:
- ✅ Filtro por tipo de serviço
- ✅ Filtro por localização (cidade/estado)
- ✅ Busca textual (nome/descrição)
- ✅ **Filtro por faixa de preço** (minPrice/maxPrice)
- ✅ **Ordenação avançada** (preço crescente/decrescente, recentes)
- ✅ **Paginação melhorada** com metadados (hasNext, hasPrev)
- ✅ **PriceRange calculado** para cada serviço
- ✅ Todas as variações incluídas (não apenas a mais barata)

### Busca de Prestadores:
- ✅ Filtro por localização (cidade/estado)
- ✅ Filtro por tipo de serviço oferecido
- ✅ Busca textual (nome/bio)
- ✅ Ordenação por quantidade de serviços ou recentes
- ✅ Paginação com metadados
- ✅ Até 5 serviços ativos por prestador na resposta
- ✅ Contagem total de serviços do prestador

---

## 📊 Ordenação Disponível

### Serviços (`sortBy`):
- `recent` (padrão) - Mais recentes primeiro
- `price_asc` - Menor preço primeiro
- `price_desc` - Maior preço primeiro

### Prestadores (`sortBy`):
- `services_count` (padrão) - Mais serviços primeiro
- `recent` - Cadastrados mais recentemente

---

## 🔐 Autenticação

- ❌ **Ambos os endpoints são públicos** (não requerem autenticação)
- 🌐 Rate limiting: 100 req/min (generalLimiter)

---

## ✅ Validações Implementadas

1. **Paginação:**
   - Limite máximo: 100 itens por página
   - Valores padrão: page=1, limit=20

2. **Filtro de Preço:**
   - Aceita valores float/decimais
   - Filtra variações dentro da faixa especificada

3. **Ordenação:**
   - Valores inválidos → fallback para ordenação padrão

---

## 🚀 Melhorias Implementadas

### Antes:
```json
{
  "services": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Depois:
```json
{
  "services": [
    {
      "...": "...",
      "priceRange": { "min": 50, "max": 150 }  // ← NOVO
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,   // ← NOVO
    "hasPrev": false   // ← NOVO
  }
}
```

---

## 📝 Próximas Fases

- **Fase 8:** Cliente - Agendamentos (Bookings)
- **Fase 9:** Provider - Dashboard de Agendamentos
- **Fase 10:** Sistema de Avaliações (Reviews)

---

## 📖 Documentação Interativa

- **Swagger UI:** http://localhost:3000/api-docs
- **Scalar:** http://localhost:3000/docs
