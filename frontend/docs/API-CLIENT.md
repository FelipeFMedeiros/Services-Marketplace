# API Client - Estrutura Modular

Esta pasta contém a configuração e organização de todas as chamadas à API do backend.

## 📁 Estrutura

```
src/data/
├── api.ts              # Configuração base do Axios + re-exports
├── auth.ts             # Autenticação e usuários
├── serviceTypes.ts     # Tipos de serviço
├── services.ts         # Serviços e variações
├── providers.ts        # Prestadores e disponibilidades
├── bookings.ts         # Agendamentos
└── reviews.ts          # Avaliações
```

## 🎯 Como Usar

### Importação Centralizada

Todos os módulos são re-exportados no `api.ts`. Você pode importar tudo de um único lugar:

```typescript
// ✅ Recomendado - Importação centralizada
import { authApi, servicesApi, providersApi, type User, type Service } from '@/data/api';

// ✅ Também funciona - Importação direta
import { authApi } from '@/data/auth';
import { servicesApi } from '@/data/services';
```

### Exemplos de Uso

#### Autenticação

```typescript
import { authApi, type LoginRequest, type User } from '@/data/api';

// Login
const response = await authApi.login({ 
  email: 'user@example.com', 
  password: '123456' 
});

// Registro
await authApi.register({
  name: 'João Silva',
  email: 'joao@example.com',
  password: '123456',
  role: 'CLIENT',
  phone: '(11) 98765-4321',
  address: 'Rua ABC, 123',
  city: 'São Paulo'
});

// Obter usuário autenticado
const { user } = await authApi.me();
```

#### Serviços

```typescript
import { servicesApi, type Service } from '@/data/api';

// Listar serviços com filtros
const { services } = await servicesApi.getAll({
  serviceTypeId: 1,
  location: 'São Paulo',
  minPrice: 50,
  maxPrice: 200
});

// Criar serviço (PROVIDER)
const { service } = await servicesApi.create({
  name: 'Limpeza Residencial',
  description: 'Limpeza completa',
  serviceTypeId: 1,
  basePrice: 150
});

// Upload de foto
const file = event.target.files[0];
await servicesApi.uploadPhoto(serviceId, file);
```

#### Providers

```typescript
import { providersApi, type ProviderProfile } from '@/data/api';

// Buscar prestadores
const { providers } = await providersApi.search({
  serviceTypeId: 1,
  location: 'São Paulo',
  minRating: 4
});

// Dashboard do prestador
const { stats } = await providersApi.getDashboard();

// Criar disponibilidade
await providersApi.createAvailability({
  dayOfWeek: 1, // Segunda-feira
  startTime: '09:00',
  endTime: '18:00'
});
```

#### Bookings

```typescript
import { bookingsApi, type Booking } from '@/data/api';

// Criar agendamento (CLIENT)
const { booking } = await bookingsApi.create({
  serviceId: 1,
  variationId: 2,
  scheduledDate: '2025-12-10T14:00:00Z',
  notes: 'Observações especiais'
});

// Listar meus agendamentos
const { bookings } = await bookingsApi.getMy({
  status: 'PENDING'
});

// Cancelar agendamento
await bookingsApi.cancel(bookingId, 'Motivo do cancelamento');
```

#### Reviews

```typescript
import { reviewsApi, type Review } from '@/data/api';

// Criar avaliação (CLIENT)
const { review } = await reviewsApi.create({
  bookingId: 1,
  rating: 5,
  comment: 'Excelente serviço!'
});

// Listar avaliações de um serviço
const { reviews } = await reviewsApi.getServiceReviews(serviceId, {
  page: 1,
  limit: 10,
  minRating: 4
});
```

## 🔐 Autenticação

A autenticação é feita via **httpOnly cookies**. O token JWT é automaticamente incluído nas requisições.

### Interceptor de Autenticação

O axios está configurado para redirecionar automaticamente para `/login` em caso de erro 401 (não autenticado):

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📝 TypeScript

Todos os métodos e respostas possuem tipagem completa:

```typescript
// Tipos de Request
type RegisterRequest = { name: string; email: string; ... }
type LoginRequest = { email: string; password: string }
type CreateServiceRequest = { name: string; description: string; ... }

// Tipos de Response
type AuthResponse = { message: string; user: User }
type ServiceResponse = { service: Service }
type ServicesResponse = { services: Service[] }

// Tipos de Models
type User = { id: number; name: string; email: string; ... }
type Service = { id: number; name: string; basePrice: number; ... }
type Booking = { id: number; status: BookingStatus; ... }
```

## 🌐 Variável de Ambiente

Configure a URL da API no arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📊 Módulos Disponíveis

### authApi
- `register(data)` - Registrar novo usuário
- `login(data)` - Fazer login
- `logout()` - Fazer logout
- `me()` - Obter usuário autenticado

### serviceTypesApi
- `getAll()` - Listar tipos de serviço
- `getById(id)` - Buscar tipo por ID

### servicesApi
- `create(data)` - Criar serviço (PROVIDER)
- `getAll(params)` - Listar serviços (público)
- `getMy()` - Meus serviços (PROVIDER)
- `getById(id)` - Buscar por ID (público)
- `update(id, data)` - Atualizar (PROVIDER)
- `delete(id)` - Deletar (PROVIDER)
- `createVariation(serviceId, data)` - Criar variação
- `updateVariation(serviceId, variationId, data)` - Atualizar variação
- `deleteVariation(serviceId, variationId)` - Deletar variação
- `uploadPhoto(serviceId, file)` - Upload de foto
- `setCoverPhoto(serviceId, photoId)` - Definir capa
- `deletePhoto(serviceId, photoId)` - Deletar foto

### providersApi
- `updateProfile(data)` - Atualizar perfil (PROVIDER)
- `search(params)` - Buscar prestadores (público)
- `getById(id)` - Perfil do prestador (público)
- `createAvailability(data)` - Criar disponibilidade
- `getAvailabilities()` - Listar disponibilidades
- `updateAvailability(id, data)` - Atualizar disponibilidade
- `deleteAvailability(id)` - Deletar disponibilidade
- `getAvailableSlots(providerId, params)` - Slots disponíveis (público)
- `getBookings(params)` - Agendamentos do prestador
- `getDashboard()` - Estatísticas do dashboard
- `approveBooking(bookingId)` - Aprovar agendamento
- `cancelBooking(bookingId, reason)` - Cancelar agendamento
- `completeBooking(bookingId)` - Marcar como concluído
- `getNotifications(params)` - Listar notificações
- `markNotificationAsRead(id)` - Marcar como lida

### bookingsApi
- `create(data)` - Criar agendamento (CLIENT)
- `getMy(params)` - Meus agendamentos (CLIENT)
- `getById(id)` - Detalhes do agendamento
- `cancel(id, reason)` - Cancelar (CLIENT)

### reviewsApi
- `create(data)` - Criar avaliação (CLIENT)
- `getMy()` - Minhas avaliações (CLIENT)
- `getServiceReviews(serviceId, params)` - Avaliações do serviço (público)
- `getById(id)` - Buscar por ID (público)
- `update(id, data)` - Atualizar (CLIENT)
- `delete(id)` - Deletar (CLIENT)

## 🎨 Boas Práticas

1. **Sempre use tipagem**: Importe os tipos necessários
2. **Trate erros**: Use try/catch em todas as chamadas
3. **Loading states**: Mostre feedback visual durante requisições
4. **Validação**: Use Zod para validar dados antes de enviar

```typescript
try {
  setLoading(true);
  const { services } = await servicesApi.getAll({ location: city });
  setServices(services);
} catch (error) {
  console.error('Erro ao buscar serviços:', error);
  setError('Falha ao carregar serviços');
} finally {
  setLoading(false);
}
```
