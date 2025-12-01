# Testando Agenda de Disponibilidades

## Fase 6: Provider Availabilities

### 1. Criar Bloco de Disponibilidade

**Endpoint:** `POST /api/providers/availabilities`  
**Autenticação:** Obrigatória (PROVIDER)

```bash
# Criar disponibilidade de segunda-feira, 15/12/2025 das 08:00 às 18:00
curl -X POST http://localhost:3000/api/providers/availabilities \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "startDatetime": "2025-12-15T08:00:00",
    "endDatetime": "2025-12-15T18:00:00"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Disponibilidade criada com sucesso",
  "availability": {
    "id": 1,
    "provider_id": 1,
    "start_datetime": "2025-12-15T08:00:00.000Z",
    "end_datetime": "2025-12-15T18:00:00.000Z",
    "is_active": true,
    "created_at": "2025-12-01T20:00:00.000Z",
    "updated_at": "2025-12-01T20:00:00.000Z"
  }
}
```

**Validações:**
- ✅ Data início < data fim
- ✅ Não permitir datas no passado
- ✅ Não permitir sobreposição de períodos
- ✅ Apenas PROVIDER autenticado

---

### 2. Listar Minhas Disponibilidades

**Endpoint:** `GET /api/providers/availabilities`  
**Autenticação:** Obrigatória (PROVIDER)

```bash
# Listar todas as disponibilidades
curl -X GET http://localhost:3000/api/providers/availabilities \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"

# Filtrar apenas ativas
curl -X GET "http://localhost:3000/api/providers/availabilities?active=true" \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"

# Filtrar por período
curl -X GET "http://localhost:3000/api/providers/availabilities?startDate=2025-12-15T00:00:00&endDate=2025-12-20T23:59:59" \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"
```

**Resposta esperada:**
```json
{
  "count": 5,
  "availabilities": [
    {
      "id": 1,
      "provider_id": 1,
      "start_datetime": "2025-12-15T08:00:00.000Z",
      "end_datetime": "2025-12-15T18:00:00.000Z",
      "is_active": true,
      "created_at": "2025-12-01T20:00:00.000Z",
      "updated_at": "2025-12-01T20:00:00.000Z"
    }
  ]
}
```

---

### 3. Atualizar Disponibilidade

**Endpoint:** `PUT /api/providers/availabilities/:id`  
**Autenticação:** Obrigatória (PROVIDER, apenas dono)

```bash
# Mudar horário de funcionamento
curl -X PUT http://localhost:3000/api/providers/availabilities/1 \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "startDatetime": "2025-12-15T09:00:00",
    "endDatetime": "2025-12-15T17:00:00"
  }'

# Desativar disponibilidade
curl -X PUT http://localhost:3000/api/providers/availabilities/1 \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Resposta esperada:**
```json
{
  "message": "Disponibilidade atualizada com sucesso",
  "availability": {
    "id": 1,
    "provider_id": 1,
    "start_datetime": "2025-12-15T09:00:00.000Z",
    "end_datetime": "2025-12-15T17:00:00.000Z",
    "is_active": true,
    "created_at": "2025-12-01T20:00:00.000Z",
    "updated_at": "2025-12-01T20:05:00.000Z"
  }
}
```

---

### 4. Deletar Disponibilidade

**Endpoint:** `DELETE /api/providers/availabilities/:id`  
**Autenticação:** Obrigatória (PROVIDER, apenas dono)

```bash
curl -X DELETE http://localhost:3000/api/providers/availabilities/1 \
  -H "Cookie: token=SEU_TOKEN_JWT_AQUI"
```

**Resposta esperada:**
```json
{
  "message": "Disponibilidade deletada com sucesso"
}
```

**Observações:**
- ❌ Não permite deletar se houver bookings confirmados no período
- 💡 Retorna erro 400 com contagem de bookings se tentar deletar

---

### 5. Buscar Slots Disponíveis (Público - para clientes)

**Endpoint:** `GET /api/providers/:id/available-slots`  
**Autenticação:** Não requerida (público)

```bash
# Buscar slots livres do prestador ID=1 entre 15 e 20 de dezembro
curl -X GET "http://localhost:3000/api/providers/1/available-slots?startDate=2025-12-15T00:00:00&endDate=2025-12-20T23:59:59"

# Buscar apenas slots com duração mínima de 60 minutos
curl -X GET "http://localhost:3000/api/providers/1/available-slots?startDate=2025-12-15T00:00:00&endDate=2025-12-20T23:59:59&durationMinutes=60"
```

**Resposta esperada:**
```json
{
  "provider": {
    "id": 1,
    "name": "Maria Silva"
  },
  "period": {
    "start": "2025-12-15T00:00:00",
    "end": "2025-12-20T23:59:59"
  },
  "availableSlots": [
    {
      "start": "2025-12-15T08:00:00.000Z",
      "end": "2025-12-15T10:00:00.000Z",
      "durationMinutes": 120
    },
    {
      "start": "2025-12-15T11:00:00.000Z",
      "end": "2025-12-15T18:00:00.000Z",
      "durationMinutes": 420
    },
    {
      "start": "2025-12-16T08:00:00.000Z",
      "end": "2025-12-16T18:00:00.000Z",
      "durationMinutes": 600
    }
  ],
  "totalSlots": 3
}
```

**Como funciona:**
1. Busca todas as disponibilidades do prestador no período
2. Busca todos os bookings confirmados (PENDING/APPROVED) no período
3. Calcula períodos livres subtraindo os bookings das disponibilidades
4. Retorna apenas slots que atendem à duração mínima (se especificada)

**Casos de uso:**
- Cliente quer ver quando o prestador está livre
- Frontend exibe calendário com horários disponíveis
- Sistema de agendamento verifica se horário escolhido está livre

---

## Fluxo Completo de Uso

### Para o Prestador:

**1. Definir Agenda Semanal**
```bash
# Segunda-feira 08:00-18:00
POST /api/providers/availabilities
{ "startDatetime": "2025-12-15T08:00:00", "endDatetime": "2025-12-15T18:00:00" }

# Terça-feira 08:00-18:00
POST /api/providers/availabilities
{ "startDatetime": "2025-12-16T08:00:00", "endDatetime": "2025-12-16T18:00:00" }

# Quarta-feira 08:00-12:00 (meio período)
POST /api/providers/availabilities
{ "startDatetime": "2025-12-17T08:00:00", "endDatetime": "2025-12-17T12:00:00" }
```

**2. Visualizar Agenda**
```bash
GET /api/providers/availabilities
```

**3. Ajustar Horário**
```bash
PUT /api/providers/availabilities/1
{ "endDatetime": "2025-12-15T17:00:00" }
```

**4. Bloquear Data (desativar)**
```bash
PUT /api/providers/availabilities/2
{ "isActive": false }
```

---

### Para o Cliente:

**1. Ver Prestador e Serviços**
```bash
GET /api/providers/1
```

**2. Verificar Horários Disponíveis**
```bash
GET /api/providers/1/available-slots?startDate=2025-12-15T00:00:00&endDate=2025-12-20T23:59:59&durationMinutes=60
```

**3. Escolher Horário e Contratar** (próxima fase)
```bash
POST /api/bookings
{
  "serviceId": 1,
  "variationId": 1,
  "startDatetime": "2025-12-15T14:00:00"
}
```

---

## Exemplos de Cenários

### Cenário 1: Prestador com horário fixo
```
Disponibilidade: Segunda a Sexta, 08:00-18:00
Almoço: 12:00-13:00 (criar 2 blocos: 08:00-12:00 e 13:00-18:00)
```

### Cenário 2: Prestador com horário flexível
```
Disponibilidades criadas por dia conforme necessidade
Ex: 15/12 09:00-17:00, 16/12 14:00-22:00
```

### Cenário 3: Bloquear feriado
```
PUT /api/providers/availabilities/:id { "isActive": false }
Ou simplesmente não criar disponibilidade para aquele dia
```

### Cenário 4: Cliente escolhendo horário
```
1. GET /available-slots → vê [08:00-10:00, 14:00-18:00]
2. Escolhe 15:00
3. POST /bookings com variation de 60min → reserva 15:00-16:00
4. Próximo cliente GET /available-slots → vê [08:00-10:00, 14:00-15:00, 16:00-18:00]
```

---

## Validações Implementadas

✅ **Criar:**
- Data início < data fim
- Não criar no passado
- Não sobrepor com disponibilidades existentes
- Apenas PROVIDER pode criar

✅ **Atualizar:**
- Validar novas datas se fornecidas
- Não sobrepor ao atualizar
- Apenas dono pode atualizar

✅ **Deletar:**
- Apenas dono pode deletar
- Não deletar se houver bookings confirmados
- Hard delete (remove permanentemente)

✅ **Slots Disponíveis:**
- Calcula períodos livres automaticamente
- Considera bookings confirmados
- Filtra por duração mínima
- Público (não precisa autenticação)

---

## Próximos Passos

Após implementar a agenda, falta:

📅 **Fase 7:** Bookings/Contratações (cliente agenda serviço)
📅 **Fase 8:** Painel do Prestador (ver agenda com bookings)
📅 **Fase 9:** Notificações (avisar novos bookings)
📅 **Fase 10:** Reviews/Avaliações
