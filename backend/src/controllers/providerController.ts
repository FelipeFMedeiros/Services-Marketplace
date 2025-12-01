import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * PUT /api/providers/profile
 * Atualiza o perfil do prestador autenticado
 * Requer autenticação e role PROVIDER
 */
export async function updateProviderProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Não autenticado.'
      });
      return;
    }

    // Verificar se é um prestador
    if (req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        message: 'Apenas prestadores podem atualizar o perfil de prestador.'
      });
      return;
    }

    const { bio, document, city, state } = req.body;

    // Buscar o provider vinculado ao usuário
    const existingProvider = await prisma.provider.findUnique({
      where: { user_id: req.user.userId }
    });

    if (!existingProvider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado.'
      });
      return;
    }

    // Atualizar apenas os campos fornecidos
    const updatedProvider = await prisma.provider.update({
      where: { user_id: req.user.userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(document !== undefined && { document }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      data: {
        provider: updatedProvider
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil do prestador.'
    });
  }
}

/**
 * GET /api/providers/:id
 * Busca perfil público de um prestador por ID
 * Não requer autenticação
 */
export async function getProviderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
            // email não incluído por privacidade
          }
        },
        services: {
          where: { is_active: true },
          include: {
            serviceType: true,
            photos: {
              where: { is_cover: true },
              take: 1
            },
            variations: {
              where: { is_active: true },
              orderBy: { price: 'asc' }
            },
            _count: {
              select: {
                reviews: true
              }
            }
          }
        }
      }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Prestador não encontrado.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        provider
      }
    });
  } catch (error) {
    console.error('Erro ao buscar prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar prestador.'
    });
  }
}

/**
 * GET /api/providers/search
 * Buscar prestadores com filtros avançados
 * Rota pública para clientes navegarem
 */
export async function searchProviders(req: Request, res: Response): Promise<void> {
  try {
    const {
      city,
      state,
      serviceTypeId,
      search,
      sortBy = 'services_count',
      page = '1',
      limit = '20'
    } = req.query;

    // Construir filtro
    const where: any = {};

    // Filtro por localização
    if (city) where.city = city as string;
    if (state) where.state = state as string;

    // Filtro por tipo de serviço (prestadores que oferecem esse tipo)
    if (serviceTypeId) {
      where.services = {
        some: {
          service_type_id: parseInt(serviceTypeId as string),
          is_active: true
        }
      };
    }

    // Busca por nome ou bio
    if (search) {
      where.OR = [
        { user: { name: { contains: search as string } } },
        { bio: { contains: search as string } }
      ];
    }

    // Definir ordenação
    let orderBy: any = {};
    
    switch (sortBy) {
      case 'services_count':
        // Ordenar por quantidade de serviços ativos
        orderBy = { services: { _count: 'desc' } };
        break;
      case 'recent':
        // Mais recentes
        orderBy = { created_at: 'desc' };
        break;
      default:
        orderBy = { services: { _count: 'desc' } };
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Buscar prestadores
    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          services: {
            where: { is_active: true },
            include: {
              serviceType: {
                select: {
                  id: true,
                  name: true
                }
              },
              photos: {
                where: { is_cover: true },
                take: 1
              },
              variations: {
                where: { is_active: true },
                orderBy: { price: 'asc' },
                take: 1 // Apenas a variação mais barata
              }
            },
            take: 5 // Mostrar até 5 serviços por prestador
          },
          _count: {
            select: {
              services: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.provider.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        providers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar prestadores.'
    });
  }
}
