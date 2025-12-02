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

/**
 * GET /api/providers/bookings
 * Listar agendamentos/contratações recebidas pelo prestador
 * Apenas PROVIDER autenticado
 */
export async function getProviderBookings(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { status, startDate, endDate, page = '1', limit = '20' } = req.query;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado'
      });
      return;
    }

    // Construir filtro
    const where: any = {
      provider_id: provider.id
    };

    // Filtrar por status
    if (status) {
      where.status = status as string;
    }

    // Filtrar por período
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        where.AND.push({
          start_datetime: { gte: new Date(startDate as string) }
        });
      }
      
      if (endDate) {
        where.AND.push({
          start_datetime: { lte: new Date(endDate as string) }
        });
      }
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Buscar agendamentos
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          service: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
          serviceVariation: {
            select: {
              id: true,
              name: true,
              price: true,
              duration_minutes: true
            }
          }
        },
        orderBy: {
          start_datetime: 'asc'
        },
        skip,
        take: limitNum
      }),
      prisma.booking.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
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
    console.error('Erro ao buscar agendamentos do prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamentos'
    });
  }
}

/**
 * GET /api/providers/dashboard/stats
 * Estatísticas e métricas do prestador
 * Apenas PROVIDER autenticado
 */
export async function getProviderStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado'
      });
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Buscar estatísticas em paralelo
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      completedBookings,
      cancelledBookings,
      monthlyBookings,
      weeklyBookings,
      upcomingBookings,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      // Total de agendamentos
      prisma.booking.count({
        where: { provider_id: provider.id }
      }),
      
      // Por status
      prisma.booking.count({
        where: { provider_id: provider.id, status: 'PENDING' }
      }),
      prisma.booking.count({
        where: { provider_id: provider.id, status: 'APPROVED' }
      }),
      prisma.booking.count({
        where: { provider_id: provider.id, status: 'COMPLETED' }
      }),
      prisma.booking.count({
        where: { provider_id: provider.id, status: 'CANCELLED' }
      }),
      
      // Agendamentos do mês
      prisma.booking.count({
        where: {
          provider_id: provider.id,
          created_at: { gte: startOfMonth }
        }
      }),
      
      // Agendamentos da semana
      prisma.booking.count({
        where: {
          provider_id: provider.id,
          created_at: { gte: startOfWeek }
        }
      }),
      
      // Próximos agendamentos (futuro, aprovados)
      prisma.booking.findMany({
        where: {
          provider_id: provider.id,
          status: 'APPROVED',
          start_datetime: { gte: now }
        },
        include: {
          client: {
            select: {
              name: true,
              phone: true
            }
          },
          service: {
            select: {
              title: true
            }
          },
          serviceVariation: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          start_datetime: 'asc'
        },
        take: 5
      }),
      
      // Receita total (completed)
      prisma.booking.aggregate({
        where: {
          provider_id: provider.id,
          status: 'COMPLETED'
        },
        _sum: {
          price_at_booking: true
        }
      }),
      
      // Receita do mês (completed)
      prisma.booking.aggregate({
        where: {
          provider_id: provider.id,
          status: 'COMPLETED',
          created_at: { gte: startOfMonth }
        },
        _sum: {
          price_at_booking: true
        }
      })
    ]);

    // Contar notificações não lidas
    const unreadNotifications = await prisma.notification.count({
      where: {
        provider_id: provider.id,
        is_read: false
      }
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          thisMonth: monthlyBookings,
          thisWeek: weeklyBookings
        },
        revenue: {
          total: totalRevenue._sum.price_at_booking || 0,
          thisMonth: monthlyRevenue._sum.price_at_booking || 0
        },
        upcoming: upcomingBookings,
        notifications: {
          unread: unreadNotifications
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
}

/**
 * GET /api/providers/notifications
 * Listar notificações do prestador
 * Apenas PROVIDER autenticado
 */
export async function getProviderNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { isRead, page = '1', limit = '20' } = req.query;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado'
      });
      return;
    }

    // Construir filtro
    const where: any = {
      provider_id: provider.id
    };

    if (isRead !== undefined) {
      where.is_read = isRead === 'true';
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Buscar notificações
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          booking: {
            include: {
              client: {
                select: {
                  name: true
                }
              },
              service: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.notification.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
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
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações'
    });
  }
}

/**
 * PATCH /api/providers/notifications/:id/read
 * Marcar notificação como lida
 * Apenas PROVIDER autenticado
 */
export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado'
      });
      return;
    }

    // Verificar se a notificação existe e pertence ao prestador
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
      return;
    }

    if (notification.provider_id !== provider.id) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para marcar esta notificação'
      });
      return;
    }

    // Marcar como lida
    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { is_read: true }
    });

    res.status(200).json({
      success: true,
      message: 'Notificação marcada como lida',
      data: {
        notification: updatedNotification
      }
    });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar notificação'
    });
  }
}

/**
 * PATCH /api/providers/bookings/:id/cancel
 * Prestador cancela um agendamento
 * Apenas PROVIDER autenticado
 */
export async function cancelProviderBooking(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reason } = req.body;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Perfil de prestador não encontrado'
      });
      return;
    }

    // Buscar a contratação
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            title: true
          }
        },
        serviceVariation: {
          select: {
            name: true
          }
        }
      }
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
      return;
    }

    // Verificar se pertence ao prestador
    if (booking.provider_id !== provider.id) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para cancelar este agendamento'
      });
      return;
    }

    // Verificar se já está cancelada ou concluída
    if (booking.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        message: 'Este agendamento já foi cancelado'
      });
      return;
    }

    if (booking.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um agendamento já concluído'
      });
      return;
    }

    // Atualizar status para CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancellation_reason: reason || 'Cancelado pelo prestador'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            id: true,
            title: true
          }
        },
        serviceVariation: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_minutes: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: {
        booking: updatedBooking
      }
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar agendamento'
    });
  }
}
