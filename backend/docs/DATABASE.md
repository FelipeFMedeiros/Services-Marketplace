# 📊 Documentação do Banco de Dados

## Melhorias Implementadas no Schema

### ✨ Novas Funcionalidades Adicionadas:

#### 1️⃣ **Avaliações de Clientes** (Requisito Extra)
- Tabela `reviews` criada
- Campos: `rating` (1-5 estrelas), `comment`, vinculado a `booking`
- Relação única: cada booking pode ter apenas 1 avaliação
- Índices para performance nas buscas por serviço

#### 2️⃣ **Descontos em Dias Específicos** (Requisito Extra)
Adicionado em `service_variations`:
- `discount_percentage`: Percentual de desconto (ex: 10.00 = 10%)
- `discount_days`: Dias da semana ou datas específicas
  - Exemplos: `"monday,friday"` ou `"2025-12-25,2025-12-31"`

#### 3️⃣ **Notificações Externas** (Requisito Extra)
Adicionado em `notifications`:
- `email_sent`: Controla se email foi enviado
- `whatsapp_sent`: Controla se WhatsApp foi enviado
- `telegram_sent`: Controla se Telegram foi enviado

#### 4️⃣ **Serviços Longos/Múltiplos Dias** (Requisito Extra)
Adicionado em `services`:
- `is_multiday`: Boolean para identificar serviços que duram vários dias
- O sistema já suporta via `start_datetime` e `end_datetime` em bookings

#### 5️⃣ **Geolocalização** (Requisito Extra)
- Campos `city` e `state` em `providers`
- Índice composto `[city, state]` para buscas rápidas
- Preparado para integração com Elasticsearch

### 🔧 Melhorias Técnicas:

#### **Enums para Tipo-Segurança**
```prisma
enum UserRole {
  CLIENT, PROVIDER, ADMIN
}

enum BookingStatus {
  PENDING, APPROVED, CANCELLED, COMPLETED
}

enum NotificationType {
  NEW_BOOKING, BOOKING_CANCELLED, BOOKING_REMINDER, REVIEW_RECEIVED
}
```

#### **Índices para Performance**
- `@@index([email])` em users
- `@@index([city, state])` em providers
- `@@index([start_datetime, end_datetime])` em bookings
- `@@index([is_active])` em services e variations

#### **Timestamps Automáticos**
- `created_at DateTime @default(now())`
- `updated_at DateTime @updatedAt`

#### **Soft Delete**
- `cancelled_at` em bookings
- `is_active` em services e variations

#### **Cascade Deletes**
- `onDelete: Cascade` nas relações principais
- Garante integridade referencial

### 📐 Estrutura das Tabelas:

```
users (Usuários - clientes, prestadores, admins)
  ↓
providers (Dados extras do prestador)
  ↓
services (Serviços oferecidos)
  ↓
service_variations (Variações de preço/duração)
  ↓
bookings (Contratações/Reservas)
  ↓
reviews (Avaliações dos clientes)
```

### 🔗 Relacionamentos Principais:

1. **User → Provider**: 1:1 (um usuário pode ser prestador)
2. **Provider → Services**: 1:N (um prestador tem vários serviços)
3. **Service → Variations**: 1:N (um serviço tem várias variações)
4. **Booking → Review**: 1:1 (cada booking pode ter 1 avaliação)
5. **Provider → Availabilities**: 1:N (prestador tem vários horários)

### 🎯 Casos de Uso Cobertos:

#### ✅ Requisitos Obrigatórios:
- [x] Cadastro de prestador
- [x] Criar serviços com tipos globais
- [x] Variações (nome, preço, duração)
- [x] Fotos dos serviços
- [x] Agenda de disponibilidades
- [x] Cliente navegar e contratar
- [x] Sistema de reservas sem sobreposição
- [x] Painel do prestador
- [x] Notificações de contratação
- [x] Cancelamento de contratações

#### ✅ Requisitos Extras:
- [x] Notificações externas (email, WhatsApp, Telegram)
- [x] Descontos em dias específicos
- [x] Avaliações de clientes
- [x] Geolocalização (cidade/estado)
- [x] Preparado para Elasticsearch
- [x] Serviços de múltiplos dias

## 🚀 Próximos Passos:

1. Rodar migration para criar o banco
2. Popular `service_types` com tipos globais
3. Criar seeds para testes
4. Implementar controllers e rotas
