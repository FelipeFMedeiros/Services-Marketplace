# 📊 FASE 9: Prestador - Dashboard e Notificações

## 📋 Resumo

Sistema completo de painel administrativo para prestadores, com visualização de agendamentos, estatísticas, receita e sistema de notificações automáticas.

---

## 🎯 Endpoints Implementados

### 1. **GET /api/providers/bookings** - Listar Agendamentos Recebidos

**Autenticado** | Apenas PROVIDER

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | string | Filtrar por status | `APPROVED`, `PENDING`, `CANCELLED`, `COMPLETED` |
| `startDate` | datetime | Agendamentos a partir de | `2025-12-01T00:00:00` |
| `endDate` | datetime | Agendamentos até | `2025-12-31T23:59:59` |
| `page` | integer | Número da página | `1` |
| `limit` | integer | Itens por página (máx 100) | `20` |

#### Resposta:

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
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
        "service": {
          "id": 1,
          "title": "Corte de Cabelo Masculino",
          "description": "Corte moderno..."
        },
        "serviceVariation": {
          "id": 2,
          "name": "Corte + Barba",
          "price": 80.00,
          "duration_minutes": 60
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

### 2. **GET /api/providers/dashboard/stats** - Estatísticas do Prestador

**Autenticado** | Apenas PROVIDER

#### Resposta:

```json
{
  "success": true,
  "data": {
    "bookings": {
      "total": 150,
      "pending": 5,
      "approved": 12,
      "completed": 120,
      "cancelled": 13,
      "thisMonth": 25,
      "thisWeek": 8
    },
    "revenue": {
      "total": 12500.00,
      "thisMonth": 2800.00
    },
    "upcoming": [
      {
        "id": 45,
        "start_datetime": "2025-12-05T10:00:00.000Z",
        "end_datetime": "2025-12-05T11:00:00.000Z",
        "price_at_booking": 80.00,
        "status": "APPROVED",
        "client": {
          "name": "João Carlos",
          "phone": "11977777777"
        },
        "service": {
          "title": "Corte de Cabelo Masculino"
        },
        "serviceVariation": {
          "name": "Corte + Barba"
        }
      }
    ],
    "notifications": {
      "unread": 3
    }
  }
}
```

#### Métricas Calculadas:

✅ **Bookings por Status**
- Total de agendamentos (todos os status)
- Contagem individual por status (PENDING, APPROVED, COMPLETED, CANCELLED)
- Agendamentos do mês atual
- Agendamentos da semana atual

✅ **Receita**
- Receita total (apenas COMPLETED)
- Receita do mês atual (apenas COMPLETED)

✅ **Próximos Agendamentos**
- Máximo 5 próximos eventos
- Apenas status APPROVED
- Ordenados por data/hora crescente
- Com dados do cliente e serviço

✅ **Notificações**
- Contagem de notificações não lidas

---

### 3. **GET /api/providers/notifications** - Listar Notificações

**Autenticado** | Apenas PROVIDER

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `isRead` | boolean | Filtrar por lidas/não lidas | `false` |
| `page` | integer | Número da página | `1` |
| `limit` | integer | Itens por página (máx 100) | `20` |

#### Resposta:

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 12,
        "provider_id": 1,
        "booking_id": 15,
        "type": "NEW_BOOKING",
        "message": "Nova contratação de Maria Oliveira para Corte de Cabelo Masculino - Corte + Barba em 15/12/2025 14:00",
        "is_read": false,
        "email_sent": false,
        "whatsapp_sent": false,
        "telegram_sent": false,
        "created_at": "2025-12-01T22:30:00.000Z",
        "booking": {
          "id": 15,
          "start_datetime": "2025-12-15T14:00:00.000Z",
          "status": "APPROVED",
          "client": {
            "name": "Maria Oliveira"
          },
          "service": {
            "title": "Corte de Cabelo Masculino"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Tipos de Notificação:

| Tipo | Descrição | Quando é gerada |
|------|-----------|-----------------|
| `NEW_BOOKING` | Nova contratação recebida | Ao criar booking (POST /api/bookings) |
| `BOOKING_CANCELLED` | Contratação foi cancelada | Ao cancelar booking (PATCH /api/bookings/:id/cancel) |
| `BOOKING_REMINDER` | Lembrete de agendamento | (Futuro - cron job) |
| `REVIEW_RECEIVED` | Nova avaliação recebida | (Futuro - sistema de reviews) |

---

### 4. **PATCH /api/providers/notifications/:id/read** - Marcar Notificação Como Lida

**Autenticado** | Apenas PROVIDER

#### Resposta:

```json
{
  "success": true,
  "message": "Notificação marcada como lida",
  "data": {
    "notification": {
      "id": 12,
      "provider_id": 1,
      "booking_id": 15,
      "type": "NEW_BOOKING",
      "message": "Nova contratação...",
      "is_read": true,
      "created_at": "2025-12-01T22:30:00.000Z"
    }
  }
}
```

---

## 🔔 Sistema de Notificações Automáticas

### Gatilhos Implementados:

#### 1. **Nova Contratação** (NEW_BOOKING)

**Quando:** Cliente cria booking via `POST /api/bookings`

**Ação:**
```typescript
await prisma.notification.create({
  data: {
    provider_id: service.provider_id,
    booking_id: booking.id,
    type: 'NEW_BOOKING',
    message: `Nova contratação de ${cliente} para ${serviço} em ${data}`
  }
});
```

#### 2. **Cancelamento** (BOOKING_CANCELLED)

**Quando:** Cliente cancela booking via `PATCH /api/bookings/:id/cancel`

**Ação:**
```typescript
await prisma.notification.create({
  data: {
    provider_id: booking.provider_id,
    booking_id: booking.id,
    type: 'BOOKING_CANCELLED',
    message: `Contratação cancelada: ${serviço}. Motivo: ${motivo}`
  }
});
```

---

## 🧪 Exemplos de Uso

### Listar todos os agendamentos aprovados

```bash
curl http://localhost:3000/api/providers/bookings?status=APPROVED \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

### Ver estatísticas do dashboard

```bash
curl http://localhost:3000/api/providers/dashboard/stats \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

### Listar notificações não lidas

```bash
curl "http://localhost:3000/api/providers/notifications?isRead=false" \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

### Marcar notificação como lida

```bash
curl -X PATCH http://localhost:3000/api/providers/notifications/12/read \
  -H "Cookie: token=SEU_JWT_TOKEN"
```

---

## 📊 Métricas do Dashboard

### Período de Tempo

| Métrica | Cálculo | Descrição |
|---------|---------|-----------|
| `thisMonth` | `created_at >= início do mês` | Agendamentos criados este mês |
| `thisWeek` | `created_at >= início da semana (domingo)` | Agendamentos criados esta semana |

### Receita

| Campo | Filtro | Descrição |
|-------|--------|-----------|
| `revenue.total` | `status = COMPLETED` | Soma total de `price_at_booking` |
| `revenue.thisMonth` | `status = COMPLETED AND created_at >= mês atual` | Receita do mês |

### Próximos Agendamentos

- ✅ Apenas `status = APPROVED`
- ✅ `start_datetime >= agora`
- ✅ Ordenado por `start_datetime ASC`
- ✅ Limitado a 5 resultados

---

## 🔐 Autenticação e Permissões

| Endpoint | Autenticação | Role | Permissão Especial |
|----------|--------------|------|-------------------|
| GET /providers/bookings | ✅ Obrigatória | PROVIDER | - |
| GET /providers/dashboard/stats | ✅ Obrigatória | PROVIDER | - |
| GET /providers/notifications | ✅ Obrigatória | PROVIDER | - |
| PATCH /providers/notifications/:id/read | ✅ Obrigatória | PROVIDER | Apenas dono da notificação |

---

## 🎨 Estrutura de Dados

### Notification Schema

```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  provider_id Int
  booking_id  Int
  type        NotificationType
  message     String   @db.Text
  is_read     Boolean  @default(false)
  
  // Notificações externas (extra - não implementadas)
  email_sent      Boolean  @default(false)
  whatsapp_sent   Boolean  @default(false)
  telegram_sent   Boolean  @default(false)
  
  created_at  DateTime @default(now())
}

enum NotificationType {
  NEW_BOOKING
  BOOKING_CANCELLED
  BOOKING_REMINDER
  REVIEW_RECEIVED
}
```

---

## ✅ Fluxo de Notificações

### Cliente cria contratação:

1. POST /api/bookings
2. Booking criado com `status = APPROVED`
3. **Notificação automática criada:**
   - `type: NEW_BOOKING`
   - `is_read: false`
   - `message: "Nova contratação de {cliente}..."`
4. Prestador recebe notificação
5. Dashboard mostra `unread: +1`

### Cliente cancela contratação:

1. PATCH /api/bookings/:id/cancel
2. Booking atualizado: `status = CANCELLED`, `cancelled_at = now()`
3. **Notificação automática criada:**
   - `type: BOOKING_CANCELLED`
   - `is_read: false`
   - `message: "Contratação cancelada..."`
4. Prestador visualiza em `/providers/notifications`
5. Marca como lida: PATCH `/providers/notifications/:id/read`

---

## 💡 Dicas para Frontend

### Dashboard Principal

**Componentes sugeridos:**

1. **Cards de Estatísticas:**
   - Total de agendamentos
   - Receita total / mês
   - Taxa de cancelamento
   - Agendamentos pendentes

2. **Lista de Próximos Agendamentos:**
   - Mostrar 5 próximos eventos
   - Data/hora formatada
   - Nome do cliente + telefone
   - Serviço contratado

3. **Badge de Notificações:**
   - Mostrar contador de não lidas
   - Link para página de notificações

### Painel de Agendamentos

**Filtros úteis:**
- Status (APPROVED, PENDING, COMPLETED, CANCELLED)
- Período (última semana, mês, customizado)
- Paginação

**Ações:**
- Visualizar detalhes do cliente
- Marcar como concluído (futuro)
- Cancelar agendamento (futuro - lado prestador)

### Notificações

**Features:**
- Badge com contador não lidas
- Lista com ícones por tipo
- Click para marcar como lida
- Click para ver detalhes do booking
- Auto-refresh a cada X segundos (polling ou WebSocket)

---

## 🚀 Extras (Não Implementados)

### Notificações Externas

O schema já possui campos para notificações externas:
- `email_sent`
- `whatsapp_sent`
- `telegram_sent`

**Para implementar:**

1. Adicionar integração de envio (SendGrid, Twilio, Telegram Bot)
2. Criar worker/cron para processar fila de notificações
3. Atualizar flags após envio bem-sucedido

### Lembretes Automáticos

**BOOKING_REMINDER:**
- Cron job que roda a cada hora
- Busca agendamentos nas próximas 24h
- Cria notificação se ainda não existe
- Pode enviar email/WhatsApp

### Webhooks

- Endpoint para receber confirmação de status
- Integração com sistemas externos
- Callbacks após conclusão de serviço

---

## 📖 Documentação Interativa

- **Swagger UI:** http://localhost:3000/api-docs
- **Scalar:** http://localhost:3000/docs

---

## 🎯 Próxima Fase

**FASE 10: Sistema de Avaliações (Reviews)**
- Cliente avalia serviço após COMPLETED
- Média de rating do prestador
- Comentários e feedback
- Filtrar serviços por rating
