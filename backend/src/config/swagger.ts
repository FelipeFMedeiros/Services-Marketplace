import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Services Marketplace API',
      version: '1.0.0',
      description: 'API para marketplace de serviços de profissionais liberais',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
          description: 'JWT token em httpOnly cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
            phone: { type: 'string', example: '11987654321' },
            role: { 
              type: 'string', 
              enum: ['CLIENT', 'PROVIDER', 'ADMIN'],
              example: 'CLIENT'
            },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Provider: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            bio: { type: 'string', example: 'Profissional com 20 anos de experiência' },
            document: { type: 'string', example: '12345678900' },
            city: { type: 'string', example: 'São Paulo' },
            state: { type: 'string', example: 'SP' }
          }
        },
        ServiceType: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Beleza e Estética' },
            description: { type: 'string', example: 'Serviços de manicure, pedicure, etc.' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erro ao processar requisição' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operação realizada com sucesso' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação e gerenciamento de usuários'
      },
      {
        name: 'Service Types',
        description: 'Tipos de serviço disponíveis'
      },
      {
        name: 'Services',
        description: 'Gerenciamento de serviços dos prestadores'
      },
      {
        name: 'Bookings',
        description: 'Contratações e reservas'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Arquivos com anotações JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
