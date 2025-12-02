# 📅 FASE 8: Sistema de Contratação (Bookings)

## 📋 Resumo

Sistema completo de contratação/agendamento de serviços para clientes, com validações de disponibilidade, controle de sobreposição e cancelamento.

---

## 🎯 Endpoints Implementados

### 1. **POST /api/bookings** - Criar Contratação

**Autenticado** | Apenas CLIENT

#### Request Body:

```json
{
  "serviceId": 1,
  "variationId": 2,
  "startDatetime": "2025-12-15T14:00:00"
}
```

#### Validações Automáticas:

✅ **Serviço existe e está ativo**  
✅ **Variação existe, está ativa e pertence ao serviço**  
✅ **Data está no futuro** (margem de 5 minutos)  
✅ **Prestador tem disponibilidade no período**  
✅ **Não há sobreposição com outros agendamentos**  
✅ **end_datetime calculado automaticamente** (start + duration_minutes)  
✅ **Cliente não pode contratar próprio serviço**  
✅ **price_at_booking salvo** (preço congelado no momento da contratação)  
✅ **Status = APPROVED** (aprovado automaticamente - sem integração de pagamento)

#### Resposta de Sucesso (201):

```json
{
  "message": "Contratação realizada com sucesso!",
  "booking": {
    "id": 15,
    "client_id": 3,
    "provider_id": 1,
    "service_id": 1,
    "service_variation_id": 2,
    "start_datetime": "2025-12-15T14:00:00.000Z",
    "end_datetime": "2025-12-15T15:00:00.000Z",
    "price_at_booking": 80.00,
    "status": "APPROVED",
    "created_at": "2025-12-01T22:30:00.000Z",
    "client": {
      "id": 3,
      "name": "Maria Oliveira",
      "email": "maria@example.com",
      "phone": "11988888888"
    },
    "provider": {
      "id": 1,
      "user": {
        "id": 2,
        "name": "João Silva",
        "phone": "11999999999"
      }
    },
    "service": {
      "id": 1,
      "title": "Corte de Cabelo Masculino",
      "description": "Corte moderno com acabamento profissional"
    },
    "variation": {
      "id": 2,
      "name": "Corte + Barba",
      "price": 80.00,
      "duration_minutes": 60
    }
  }
}
```

#### Erros Possíveis:

**400 - Dados inválidos:**
```json
{
  "error": "serviceId, variationId e startDatetime são obrigatórios"
}
```

**400 - Horário indisponível:**
```json
{
  "error": "Prestador não tem disponibilidade neste horário",
  "hint": "Use GET /api/providers/1/available-slots para ver horários disponíveis"
}
```

**400 - Sobreposição:**
```json
{
  "error": "Este horário já está ocupado",
  "conflictingBooking": {
    "start": "2025-12-15T14:00:00.000Z",
    "end": "2025-12-15T15:00:00.000Z"
  }
}
```

---

### 2. **GET /api/bookings/my** - Minhas Contratações

**Autenticado** | Apenas CLIENT

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | string | Filtrar por status | `APPROVED`, `CANCELLED`, `COMPLETED` |
| `startDate` | datetime | Contratações a partir de | `2025-12-01T00:00:00` |
| `endDate` | datetime | Contratações até | `2025-12-31T23:59:59` |

#### Resposta:

```json
{
  "count": 3,
  "bookings": [
    {
      "id": 15,
      "start_datetime": "2025-12-15T14:00:00.000Z",
      "end_datetime": "2025-12-15T15:00:00.000Z",
      "price_at_booking": 80.00,
      "status": "APPROVED",
      "created_at": "2025-12-01T22:30:00.000Z",
      "provider": {
        "id": 1,
        "city": "São Paulo",
        "state": "SP",
        "user": {
          "name": "João Silva",
          "phone": "11999999999"
        }
      },
      "service": {
        "id": 1,
        "title": "Corte de Cabelo Masculino"
      },
      "variation": {
        "id": 2,
        "name": "Corte + Barba",
        "price": 80.00,
        "duration_minutes": 60
      }
    }
  ]
}
```

---

### 3. **GET /api/bookings/:id** - Detalhes da Contratação

**Autenticado** | CLIENT (dono) ou PROVIDER (prestador envolvido)

#### Permissões:

- ✅ Cliente que fez a contratação
- ✅ Prestador que oferece o serviço
- ❌ Outros usuários

#### Resposta:

```json
{
  "booking": {
    "id": 15,
    "start_datetime": "2025-12-15T14:00:00.000Z",
    "end_datetime": "2025-12-15T15:00:00.000Z",
    "price_at_booking": 80.00,
    "status": "APPROVED",
    "created_at": "2025-12-01T22:30:00.000Z",
    "client": {
      "id": 3,
      "name": "Maria Oliveira",
      "email": "maria@example.com",
      "phone": "11988888888"
    },
    "provider": {
      "id": 1,
      "city": "São Paulo",
      "state": "SP",
      "user": {
        "name": "João Silva",
        "phone": "11999999999"
      }
    },
    "service": {
      "id": 1,
      "title": "Corte de Cabelo Masculino",
      "description": "Corte moderno...",
      "photos": [
        {
          "id": 1,
          "url": "https://cloudinary.com/...",
          "is_cover": true
        }
      ]
    },
    "variation": {
      "id": 2,
      "name": "Corte + Barba",
      "price": 80.00,
      "duration_minutes": 60
    }
  }
}
```

---

### 4. **PATCH /api/bookings/:id/cancel** - Cancelar Contratação

**Autenticado** | Apenas CLIENT (dono)

#### Request Body (opcional):

```json
{
  "reason": "Imprevisto, não poderei comparecer"
}
```

#### Validações:

✅ Apenas o cliente (dono) pode cancelar  
✅ Não pode cancelar se status = CANCELLED  
✅ Não pode cancelar se status = COMPLETED  
✅ Status alterado para CANCELLED  
✅ `cancelled_at` preenchido com timestamp  
✅ `cancellation_reason` salvo (ou padrão: "Cancelado pelo cliente")

#### Resposta:

```json
{
  "message": "Contratação cancelada com sucesso",
  "booking": {
    "id": 15,
    "status": "CANCELLED",
    "cancelled_at": "2025-12-05T10:30:00.000Z",
    "cancellation_reason": "Imprevisto, não poderei comparecer",
    "provider": {
      "user": {
        "name": "João Silva"
      }
    },
    "service": {
      "title": "Corte de Cabelo Masculino"
    },
    "variation": {
      "name": "Corte + Barba"
    }
  }
}
```

---

## 🔐 Autenticação e Permissões

| Endpoint | Autenticação | Role | Permissão Especial |
|----------|--------------|------|-------------------|
| POST /bookings | ✅ Obrigatória | CLIENT | - |
| GET /bookings/my | ✅ Obrigatória | CLIENT | - |
| GET /bookings/:id | ✅ Obrigatória | Qualquer | Apenas cliente ou prestador envolvido |
| PATCH /bookings/:id/cancel | ✅ Obrigatória | CLIENT | Apenas dono da contratação |

---

## 🧪 Exemplos de Uso

### Criar contratação

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: token=SEU_JWT_TOKEN" \
  -d '{
    "serviceId": 1,
    "variationId": 2,
    "startDatetime": "2025-12-15T14:00:00"
  }'
```

### Listar minhas contratações (apenas aprovadas)

```bash
curl http://localhost:3000/api/bookings/my?status=APPROVED \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

### Ver detalhes de uma contratação

```bash
curl http://localhost:3000/api/bookings/15 \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

### Cancelar contratação

```bash
curl -X PATCH http://localhost:3000/api/bookings/15/cancel \
  -H "Content-Type: application/json" \
  -H "Cookie: token=SEU_JWT_TOKEN" \
  -d '{
    "reason": "Mudança de planos"
  }'
```

---

## 📊 Status de Contratação

| Status | Descrição | Pode Cancelar? |
|--------|-----------|----------------|
| `PENDING` | Aguardando confirmação | ✅ Sim |
| `APPROVED` | Confirmada automaticamente | ✅ Sim |
| `CANCELLED` | Cancelada pelo cliente | ❌ Não |
| `COMPLETED` | Serviço já realizado | ❌ Não |

> **Nota:** No sistema atual, todas as contratações são criadas com `status = APPROVED` (aprovação automática, sem integração de pagamento conforme roteiro).

---

## 🎨 Regras de Negócio

### Validação de Disponibilidade

1. **Prestador deve ter disponibilidade cadastrada**
   - Verificado em `ProviderAvailability`
   - `start_datetime` da disponibilidade ≤ início da contratação
   - `end_datetime` da disponibilidade ≥ fim da contratação

2. **Verificação de Sobreposição**
   - Busca contratações com status `PENDING` ou `APPROVED`
   - Verifica 3 cenários de overlap:
     - Nova contratação começa durante uma existente
     - Nova contratação termina durante uma existente
     - Nova contratação engloba uma existente

### Cálculo Automático

```javascript
// end_datetime calculado automaticamente
endDate = startDate + variation.duration_minutes (em milissegundos)

// Exemplo:
start: 2025-12-15T14:00:00
duration: 60 minutos
end: 2025-12-15T15:00:00
```

### Preço Congelado

O campo `price_at_booking` congela o preço no momento da contratação:
- Mudanças futuras no preço da variação NÃO afetam contratações antigas
- Histórico de preços preservado

---

## ✅ Checklist de Validações

**Antes de criar contratação:**
- [x] Serviço existe e está ativo
- [x] Variação existe e está ativa
- [x] Variação pertence ao serviço escolhido
- [x] Data/hora está no futuro (margem: 5 min)
- [x] Prestador tem disponibilidade cadastrada
- [x] Não há sobreposição com outros agendamentos
- [x] Cliente não está contratando próprio serviço
- [x] Cálculo automático de end_datetime
- [x] Preço salvo em price_at_booking

**Antes de cancelar:**
- [x] Contratação existe
- [x] Usuário é o dono (cliente)
- [x] Status não é CANCELLED
- [x] Status não é COMPLETED

---

## 🚀 Próxima Fase

**FASE 9: Provider - Dashboard de Agendamentos**
- GET /api/providers/bookings - Listar contratações recebidas
- GET /api/providers/bookings/calendar - Visualização de agenda
- Notificações de novas contratações
- Estatísticas do prestador

---

## 📖 Documentação Interativa

- **Swagger UI:** http://localhost:3000/api-docs
- **Scalar:** http://localhost:3000/docs

---

## 💡 Dicas para Frontend

### Fluxo de Contratação

1. Cliente navega serviços (GET /api/services)
2. Seleciona um serviço e vê detalhes (GET /api/services/:id)
3. Escolhe variação desejada
4. Consulta horários disponíveis (GET /api/providers/:id/available-slots)
5. Escolhe horário e confirma (POST /api/bookings)
6. Visualiza confirmação com detalhes completos

### Feedback ao Usuário

- ✅ Sucesso → Mostrar detalhes da contratação + dados do prestador
- ❌ Horário ocupado → Sugerir horários alternativos (usar available-slots)
- ⚠️ Sem disponibilidade → Avisar que prestador não atende neste período
