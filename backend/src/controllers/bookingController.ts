import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/bookings
 * Cliente cria uma contratação/agendamento
 * Requer autenticação e role CLIENT
 */
export async function createBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { serviceId, variationId, startDatetime } = req.body;

    // Validações básicas
    if (!serviceId || !variationId || !startDatetime) {
      return res.status(400).json({
        error: 'serviceId, variationId e startDatetime são obrigatórios'
      });
    }

    // Converter data
    const startDate = new Date(startDatetime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        error: 'Formato de data/hora inválido. Use ISO 8601 (ex: 2025-12-15T14:00:00)'
      });
    }

    // Verificar se o serviço existe e está ativo
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        error: 'Este serviço não está mais disponível'
      });
    }

    // Verificar se a variação existe e está ativa
    const variation = await prisma.serviceVariation.findUnique({
      where: { id: variationId }
    });

    if (!variation) {
      return res.status(404).json({
        error: 'Variação do serviço não encontrada'
      });
    }

    if (variation.service_id !== serviceId) {
      return res.status(400).json({
        error: 'Esta variação não pertence ao serviço selecionado'
      });
    }

    if (!variation.is_active) {
      return res.status(400).json({
        error: 'Esta variação não está mais disponível'
      });
    }

    // Calcular data/hora de término baseado na duração
    const endDate = new Date(startDate.getTime() + variation.duration_minutes * 60 * 1000);

    // Validar se a data está no futuro (margem de 5 minutos)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (startDate < fiveMinutesAgo) {
      return res.status(400).json({
        error: 'Não é possível agendar no passado'
      });
    }

    // Verificar se o prestador tem disponibilidade neste período
    const availability = await prisma.providerAvailability.findFirst({
      where: {
        provider_id: service.provider_id,
        is_active: true,
        start_datetime: { lte: startDate },
        end_datetime: { gte: endDate }
      }
    });

    if (!availability) {
      return res.status(400).json({
        error: 'Prestador não tem disponibilidade neste horário',
        hint: `Use GET /api/providers/${service.provider_id}/available-slots para ver horários disponíveis`
      });
    }

    // Verificar se já existe agendamento neste período (sobreposição)
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        provider_id: service.provider_id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            // Novo agendamento começa durante um existente
            AND: [
              { start_datetime: { lte: startDate } },
              { end_datetime: { gt: startDate } }
            ]
          },
          {
            // Novo agendamento termina durante um existente
            AND: [
              { start_datetime: { lt: endDate } },
              { end_datetime: { gte: endDate } }
            ]
          },
          {
            // Novo agendamento engloba um existente
            AND: [
              { start_datetime: { gte: startDate } },
              { end_datetime: { lte: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingBooking) {
      return res.status(400).json({
        error: 'Este horário já está ocupado',
        conflictingBooking: {
          start: overlappingBooking.start_datetime,
          end: overlappingBooking.end_datetime
        }
      });
    }

    // Cliente não pode contratar o próprio serviço
    if (service.provider.user_id === userId) {
      return res.status(400).json({
        error: 'Você não pode contratar seus próprios serviços'
      });
    }

    // Criar a contratação (automaticamente aprovada conforme roteiro)
    const booking = await prisma.booking.create({
      data: {
        client_id: userId!,
        provider_id: service.provider_id,
        service_id: serviceId,
        service_variation_id: variationId,
        start_datetime: startDate,
        end_datetime: endDate,
        price_at_booking: variation.price,
        status: 'APPROVED' // Automaticamente aprovada (sem integração de pagamento)
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
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
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
      }
    });

    // Criar notificação para o prestador sobre nova contratação
    await prisma.notification.create({
      data: {
        provider_id: service.provider_id,
        booking_id: booking.id,
        type: 'NEW_BOOKING',
        message: `Nova contratação de ${booking.client.name} para ${service.title} - ${variation.name} em ${startDate.toLocaleString('pt-BR')}`
      }
    });

    return res.status(201).json({
      message: 'Contratação realizada com sucesso!',
      booking
    });

  } catch (error) {
    console.error('Erro ao criar contratação:', error);
    return res.status(500).json({
      error: 'Erro ao criar contratação'
    });
  }
}

/**
 * GET /api/bookings/my
 * Listar contratações do cliente autenticado
 */
export async function getMyBookings(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { status, startDate, endDate } = req.query;

    // Construir filtro
    const where: any = {
      client_id: userId
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

    // Buscar contratações
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
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
        start_datetime: 'desc'
      }
    });

    return res.json({
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Erro ao buscar contratações:', error);
    return res.status(500).json({
      error: 'Erro ao buscar contratações'
    });
  }
}

/**
 * GET /api/bookings/:id
 * Buscar detalhes de uma contratação específica
 * Apenas o cliente (dono) ou o prestador podem visualizar
 */
export async function getBookingById(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        },
        service: {
          include: {
            photos: {
              where: { is_cover: true },
              take: 1
            }
          }
        },
        serviceVariation: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Contratação não encontrada'
      });
    }

    // Verificar permissão: apenas cliente ou prestador podem ver
    const isClient = booking.client_id === userId;
    
    // Buscar o provider para verificar se o user_id corresponde
    const provider = await prisma.provider.findUnique({
      where: { id: booking.provider_id },
      select: { user_id: true }
    });
    const isProvider = provider?.user_id === userId;

    if (!isClient && !isProvider) {
      return res.status(403).json({
        error: 'Você não tem permissão para visualizar esta contratação'
      });
    }

    return res.json({
      booking
    });

  } catch (error) {
    console.error('Erro ao buscar contratação:', error);
    return res.status(500).json({
      error: 'Erro ao buscar contratação'
    });
  }
}

/**
 * PATCH /api/bookings/:id/cancel
 * Cancelar uma contratação
 * Apenas o cliente (dono) pode cancelar
 */
export async function cancelBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { reason } = req.body;

    // Buscar a contratação
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Contratação não encontrada'
      });
    }

    // Verificar se é o dono
    if (booking.client_id !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para cancelar esta contratação'
      });
    }

    // Verificar se já está cancelada ou concluída
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'Esta contratação já foi cancelada'
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        error: 'Não é possível cancelar uma contratação já concluída'
      });
    }

    // Atualizar status para CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancellation_reason: reason || 'Cancelado pelo cliente'
      },
      include: {
        client: {
          select: {
            name: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                name: true
              }
            }
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

    // Criar notificação para o prestador sobre cancelamento
    await prisma.notification.create({
      data: {
        provider_id: updatedBooking.provider_id,
        booking_id: updatedBooking.id,
        type: 'BOOKING_CANCELLED',
        message: `Contratação cancelada: ${updatedBooking.service.title} - ${updatedBooking.serviceVariation.name}. Motivo: ${updatedBooking.cancellation_reason}`
      }
    });

    return res.json({
      message: 'Contratação cancelada com sucesso',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Erro ao cancelar contratação:', error);
    return res.status(500).json({
      error: 'Erro ao cancelar contratação'
    });
  }
}
