import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import cloudinary from '../config/cloudinary';

const prisma = new PrismaClient();

/**
 * POST /api/services
 * Criar um novo serviço (apenas PROVIDER)
 */
export async function createService(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { name, description, serviceTypeId, allowsMultipleDays } = req.body;

    // Validações
    if (!name || !description || !serviceTypeId) {
      return res.status(400).json({
        error: 'Nome, descrição e tipo de serviço são obrigatórios'
      });
    }

    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({
        error: 'Nome deve ter entre 3 e 100 caracteres'
      });
    }

    if (description.length < 10 || description.length > 500) {
      return res.status(400).json({
        error: 'Descrição deve ter entre 10 e 500 caracteres'
      });
    }

    // Verificar se o tipo de serviço existe
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId }
    });

    if (!serviceType) {
      return res.status(400).json({
        error: 'Tipo de serviço não encontrado'
      });
    }

    // Buscar o provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        title: name,
        description,
        provider_id: provider.id,
        service_type_id: serviceTypeId,
        is_multiday: allowsMultipleDays || false,
        is_active: true
      },
      include: {
        serviceType: {
          select: {
            id: true,
            name: true
          }
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Serviço criado com sucesso',
      service
    });

  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return res.status(500).json({
      error: 'Erro ao criar serviço'
    });
  }
}

/**
 * GET /api/services
 * Listar todos os serviços ativos do marketplace com filtros
 */
export async function getAllServices(req: Request, res: Response) {
  try {
    const { serviceTypeId, city, state, search, page = '1', limit = '20' } = req.query;

    // Construir filtro
    const where: any = {
      is_active: true
    };

    // Filtro por tipo de serviço
    if (serviceTypeId) {
      where.service_type_id = parseInt(serviceTypeId as string);
    }

    // Filtro por localização (cidade/estado do provider)
    if (city || state) {
      where.provider = {};
      if (city) where.provider.city = city as string;
      if (state) where.provider.state = state as string;
    }

    // Busca por nome/descrição
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Buscar serviços com contagem total
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          serviceType: {
            select: {
              id: true,
              name: true
            }
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          variations: {
            orderBy: {
              price: 'asc'
            },
            take: 1 // Mostrar só a variação mais barata
          },
          photos: {
            where: {
              is_cover: true
            },
            take: 1
          },
          _count: {
            select: {
              variations: true,
              bookings: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.service.count({ where })
    ]);

    return res.json({
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({
      error: 'Erro ao buscar serviços'
    });
  }
}

/**
 * GET /api/services/my (autenticado PROVIDER)
 * Listar serviços do prestador autenticado
 */
export async function getMyServices(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { active } = req.query;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Construir filtro
    const where: any = {
      provider_id: provider.id
    };

    if (active !== undefined) {
      where.is_active = active === 'true';
    }

    // Buscar serviços
    const services = await prisma.service.findMany({
      where,
      include: {
        serviceType: {
          select: {
            id: true,
            name: true
          }
        },
        variations: {
          orderBy: {
            price: 'asc'
          }
        },
        photos: {
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            variations: true,
            photos: true,
            bookings: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.json({
      count: services.length,
      services
    });

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({
      error: 'Erro ao buscar serviços'
    });
  }
}

/**
 * GET /api/services/:id
 * Detalhes de um serviço específico
 */
export async function getServiceById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceType: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        variations: {
          orderBy: {
            price: 'asc'
          }
        },
        photos: {
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    return res.json(service);

  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return res.status(500).json({
      error: 'Erro ao buscar serviço'
    });
  }
}

/**
 * PUT /api/services/:id
 * Atualizar serviço (apenas o dono)
 */
export async function updateService(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, description, serviceTypeId, allowsMultipleDays, isActive } = req.body;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar este serviço'
      });
    }

    // Validações se houver mudanças
    if (name !== undefined && (name.length < 3 || name.length > 100)) {
      return res.status(400).json({
        error: 'Nome deve ter entre 3 e 100 caracteres'
      });
    }

    if (description !== undefined && (description.length < 10 || description.length > 500)) {
      return res.status(400).json({
        error: 'Descrição deve ter entre 10 e 500 caracteres'
      });
    }

    // Se mudar o tipo de serviço, verificar se existe
    if (serviceTypeId !== undefined) {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: serviceTypeId }
      });

      if (!serviceType) {
        return res.status(400).json({
          error: 'Tipo de serviço não encontrado'
        });
      }
    }

    // Construir objeto de atualização
    const updateData: any = {};
    if (name !== undefined) updateData.title = name;
    if (description !== undefined) updateData.description = description;
    if (serviceTypeId !== undefined) updateData.service_type_id = serviceTypeId;
    if (allowsMultipleDays !== undefined) updateData.is_multiday = allowsMultipleDays;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Atualizar serviço
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        serviceType: {
          select: {
            id: true,
            name: true
          }
        },
        variations: true,
        photos: true
      }
    });

    return res.json({
      message: 'Serviço atualizado com sucesso',
      service: updatedService
    });

  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar serviço'
    });
  }
}

/**
 * DELETE /api/services/:id
 * Deletar serviço (soft delete - apenas o dono)
 */
export async function deleteService(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para deletar este serviço'
      });
    }

    // Soft delete: apenas desativar
    await prisma.service.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });

    return res.json({
      message: 'Serviço desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    return res.status(500).json({
      error: 'Erro ao deletar serviço'
    });
  }
}

// ============================================
// SERVICE VARIATIONS
// ============================================

/**
 * POST /api/services/:id/variations
 * Criar variação de serviço (apenas o dono)
 */
export async function createVariation(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, price, durationMinutes, discountPercentage, discountDays } = req.body;

    // Validações
    if (!name || !price || !durationMinutes) {
      return res.status(400).json({
        error: 'Nome, preço e duração são obrigatórios'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: 'Preço deve ser maior que zero'
      });
    }

    if (durationMinutes <= 0) {
      return res.status(400).json({
        error: 'Duração deve ser maior que zero'
      });
    }

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para adicionar variações a este serviço'
      });
    }

    // Criar variação
    const variation = await prisma.serviceVariation.create({
      data: {
        service_id: parseInt(id),
        name,
        price,
        duration_minutes: durationMinutes,
        discount_percentage: discountPercentage || null,
        discount_days: discountDays || null,
        is_active: true
      }
    });

    return res.status(201).json({
      message: 'Variação criada com sucesso',
      variation
    });

  } catch (error) {
    console.error('Erro ao criar variação:', error);
    return res.status(500).json({
      error: 'Erro ao criar variação'
    });
  }
}

/**
 * PUT /api/services/:id/variations/:variationId
 * Atualizar variação de serviço (apenas o dono)
 */
export async function updateVariation(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id, variationId } = req.params;
    const { name, price, durationMinutes, discountPercentage, discountDays, isActive } = req.body;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar variações deste serviço'
      });
    }

    // Verificar se a variação existe e pertence ao serviço
    const variation = await prisma.serviceVariation.findUnique({
      where: { id: parseInt(variationId) }
    });

    if (!variation) {
      return res.status(404).json({
        error: 'Variação não encontrada'
      });
    }

    if (variation.service_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Esta variação não pertence ao serviço informado'
      });
    }

    // Validações
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        error: 'Preço deve ser maior que zero'
      });
    }

    if (durationMinutes !== undefined && durationMinutes <= 0) {
      return res.status(400).json({
        error: 'Duração deve ser maior que zero'
      });
    }

    // Construir objeto de atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (durationMinutes !== undefined) updateData.duration_minutes = durationMinutes;
    if (discountPercentage !== undefined) updateData.discount_percentage = discountPercentage;
    if (discountDays !== undefined) updateData.discount_days = discountDays;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Atualizar variação
    const updatedVariation = await prisma.serviceVariation.update({
      where: { id: parseInt(variationId) },
      data: updateData
    });

    return res.json({
      message: 'Variação atualizada com sucesso',
      variation: updatedVariation
    });

  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar variação'
    });
  }
}

/**
 * DELETE /api/services/:id/variations/:variationId
 * Deletar variação de serviço (apenas o dono)
 */
export async function deleteVariation(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id, variationId } = req.params;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para deletar variações deste serviço'
      });
    }

    // Verificar se a variação existe e pertence ao serviço
    const variation = await prisma.serviceVariation.findUnique({
      where: { id: parseInt(variationId) }
    });

    if (!variation) {
      return res.status(404).json({
        error: 'Variação não encontrada'
      });
    }

    if (variation.service_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Esta variação não pertence ao serviço informado'
      });
    }

    // Deletar variação (hard delete neste caso)
    await prisma.serviceVariation.delete({
      where: { id: parseInt(variationId) }
    });

    return res.json({
      message: 'Variação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar variação:', error);
    return res.status(500).json({
      error: 'Erro ao deletar variação'
    });
  }
}
