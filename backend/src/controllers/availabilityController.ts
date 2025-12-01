import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/providers/availabilities
 * Criar bloco de disponibilidade (apenas PROVIDER autenticado)
 */
export async function createAvailability(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { startDatetime, endDatetime } = req.body;

    // Validações
    if (!startDatetime || !endDatetime) {
      return res.status(400).json({
        error: 'Data/hora de início e fim são obrigatórias'
      });
    }

    // Converter para Date
    const startDate = new Date(startDatetime);
    const endDate = new Date(endDatetime);

    // Validar datas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Formato de data/hora inválido. Use ISO 8601 (ex: 2025-12-15T08:00:00)'
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'Data/hora de início deve ser anterior à data/hora de fim'
      });
    }

    // Permitir criar disponibilidade com margem de 5 minutos no passado
    // (evita problemas de sincronização de relógio entre cliente/servidor)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (endDate < fiveMinutesAgo) {
      return res.status(400).json({
        error: 'Não é possível criar disponibilidade que já terminou'
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

    // Verificar sobreposição com disponibilidades existentes
    const overlappingAvailability = await prisma.providerAvailability.findFirst({
      where: {
        provider_id: provider.id,
        is_active: true,
        OR: [
          {
            // Novo período começa dentro de um período existente
            AND: [
              { start_datetime: { lte: startDate } },
              { end_datetime: { gt: startDate } }
            ]
          },
          {
            // Novo período termina dentro de um período existente
            AND: [
              { start_datetime: { lt: endDate } },
              { end_datetime: { gte: endDate } }
            ]
          },
          {
            // Novo período engloba um período existente
            AND: [
              { start_datetime: { gte: startDate } },
              { end_datetime: { lte: endDate } }
            ]
          }
        ]
      }
    });

    if (overlappingAvailability) {
      return res.status(400).json({
        error: 'Já existe uma disponibilidade neste período',
        overlapping: {
          start: overlappingAvailability.start_datetime,
          end: overlappingAvailability.end_datetime
        }
      });
    }

    // Criar disponibilidade
    const availability = await prisma.providerAvailability.create({
      data: {
        provider_id: provider.id,
        start_datetime: startDate,
        end_datetime: endDate,
        is_active: true
      }
    });

    return res.status(201).json({
      message: 'Disponibilidade criada com sucesso',
      availability
    });

  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error);
    return res.status(500).json({
      error: 'Erro ao criar disponibilidade'
    });
  }
}

/**
 * GET /api/providers/availabilities
 * Listar disponibilidades do prestador autenticado
 */
export async function getMyAvailabilities(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { active, startDate, endDate } = req.query;

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

    // Filtrar por ativo/inativo
    if (active !== undefined) {
      where.is_active = active === 'true';
    }

    // Filtrar por período
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        where.AND.push({
          end_datetime: { gte: new Date(startDate as string) }
        });
      }
      
      if (endDate) {
        where.AND.push({
          start_datetime: { lte: new Date(endDate as string) }
        });
      }
    }

    // Buscar disponibilidades
    const availabilities = await prisma.providerAvailability.findMany({
      where,
      orderBy: {
        start_datetime: 'asc'
      }
    });

    return res.json({
      count: availabilities.length,
      availabilities
    });

  } catch (error) {
    console.error('Erro ao buscar disponibilidades:', error);
    return res.status(500).json({
      error: 'Erro ao buscar disponibilidades'
    });
  }
}

/**
 * PUT /api/providers/availabilities/:id
 * Atualizar bloco de disponibilidade (apenas o dono)
 */
export async function updateAvailability(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { startDatetime, endDatetime, isActive } = req.body;

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se a disponibilidade existe e pertence ao provider
    const availability = await prisma.providerAvailability.findUnique({
      where: { id: parseInt(id) }
    });

    if (!availability) {
      return res.status(404).json({
        error: 'Disponibilidade não encontrada'
      });
    }

    if (availability.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar esta disponibilidade'
      });
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Validar e atualizar datas se fornecidas
    if (startDatetime !== undefined || endDatetime !== undefined) {
      const newStartDate = startDatetime ? new Date(startDatetime) : availability.start_datetime;
      const newEndDate = endDatetime ? new Date(endDatetime) : availability.end_datetime;

      // Validar datas
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        return res.status(400).json({
          error: 'Formato de data/hora inválido'
        });
      }

      if (newStartDate >= newEndDate) {
        return res.status(400).json({
          error: 'Data/hora de início deve ser anterior à data/hora de fim'
        });
      }

      // Verificar sobreposição (excluindo a própria disponibilidade)
      const overlappingAvailability = await prisma.providerAvailability.findFirst({
        where: {
          provider_id: provider.id,
          is_active: true,
          id: { not: parseInt(id) },
          OR: [
            {
              AND: [
                { start_datetime: { lte: newStartDate } },
                { end_datetime: { gt: newStartDate } }
              ]
            },
            {
              AND: [
                { start_datetime: { lt: newEndDate } },
                { end_datetime: { gte: newEndDate } }
              ]
            },
            {
              AND: [
                { start_datetime: { gte: newStartDate } },
                { end_datetime: { lte: newEndDate } }
              ]
            }
          ]
        }
      });

      if (overlappingAvailability) {
        return res.status(400).json({
          error: 'Já existe uma disponibilidade neste período',
          overlapping: {
            start: overlappingAvailability.start_datetime,
            end: overlappingAvailability.end_datetime
          }
        });
      }

      if (startDatetime !== undefined) updateData.start_datetime = newStartDate;
      if (endDatetime !== undefined) updateData.end_datetime = newEndDate;
    }

    // Atualizar isActive se fornecido
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    // Atualizar disponibilidade
    const updatedAvailability = await prisma.providerAvailability.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.json({
      message: 'Disponibilidade atualizada com sucesso',
      availability: updatedAvailability
    });

  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar disponibilidade'
    });
  }
}

/**
 * DELETE /api/providers/availabilities/:id
 * Deletar bloco de disponibilidade (apenas o dono)
 */
export async function deleteAvailability(req: Request, res: Response) {
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

    // Verificar se a disponibilidade existe e pertence ao provider
    const availability = await prisma.providerAvailability.findUnique({
      where: { id: parseInt(id) }
    });

    if (!availability) {
      return res.status(404).json({
        error: 'Disponibilidade não encontrada'
      });
    }

    if (availability.provider_id !== provider.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para deletar esta disponibilidade'
      });
    }

    // Verificar se há bookings neste período (não permitir deletar se houver)
    const bookingsInPeriod = await prisma.booking.count({
      where: {
        provider_id: provider.id,
        status: { in: ['PENDING', 'APPROVED'] },
        start_datetime: { gte: availability.start_datetime },
        end_datetime: { lte: availability.end_datetime }
      }
    });

    if (bookingsInPeriod > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar disponibilidade com agendamentos confirmados',
        bookingsCount: bookingsInPeriod
      });
    }

    // Deletar disponibilidade (hard delete)
    await prisma.providerAvailability.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      message: 'Disponibilidade deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar disponibilidade:', error);
    return res.status(500).json({
      error: 'Erro ao deletar disponibilidade'
    });
  }
}

/**
 * GET /api/providers/:id/available-slots
 * Buscar slots disponíveis de um prestador (rota pública para clientes)
 * Retorna períodos livres considerando disponibilidades e bookings já confirmados
 */
export async function getAvailableSlots(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate, durationMinutes } = req.query;

    // Validações
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Parâmetros startDate e endDate são obrigatórios'
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Formato de data inválido. Use ISO 8601'
      });
    }

    // Buscar provider
    const provider = await prisma.provider.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!provider) {
      return res.status(404).json({
        error: 'Prestador não encontrado'
      });
    }

    // Buscar disponibilidades ativas no período
    const availabilities = await prisma.providerAvailability.findMany({
      where: {
        provider_id: parseInt(id),
        is_active: true,
        start_datetime: { lte: end },
        end_datetime: { gte: start }
      },
      orderBy: {
        start_datetime: 'asc'
      }
    });

    // Buscar bookings confirmados no período
    const bookings = await prisma.booking.findMany({
      where: {
        provider_id: parseInt(id),
        status: { in: ['PENDING', 'APPROVED'] },
        start_datetime: { lt: end },
        end_datetime: { gt: start }
      },
      orderBy: {
        start_datetime: 'asc'
      }
    });

    // Calcular slots livres
    const freeSlots = availabilities.map(avail => {
      // Encontrar bookings que intersectam com esta disponibilidade
      const conflictingBookings = bookings.filter(booking => 
        booking.start_datetime < avail.end_datetime &&
        booking.end_datetime > avail.start_datetime
      );

      // Se não houver bookings, retornar a disponibilidade completa
      if (conflictingBookings.length === 0) {
        return {
          start: avail.start_datetime,
          end: avail.end_datetime,
          durationMinutes: Math.floor((avail.end_datetime.getTime() - avail.start_datetime.getTime()) / 60000)
        };
      }

      // Calcular períodos livres entre bookings
      const freeSlots = [];
      let currentTime = avail.start_datetime;

      for (const booking of conflictingBookings.sort((a, b) => 
        a.start_datetime.getTime() - b.start_datetime.getTime()
      )) {
        // Se há espaço antes do booking
        if (currentTime < booking.start_datetime) {
          freeSlots.push({
            start: currentTime,
            end: booking.start_datetime,
            durationMinutes: Math.floor((booking.start_datetime.getTime() - currentTime.getTime()) / 60000)
          });
        }
        currentTime = booking.end_datetime > currentTime ? booking.end_datetime : currentTime;
      }

      // Espaço após o último booking até o fim da disponibilidade
      if (currentTime < avail.end_datetime) {
        freeSlots.push({
          start: currentTime,
          end: avail.end_datetime,
          durationMinutes: Math.floor((avail.end_datetime.getTime() - currentTime.getTime()) / 60000)
        });
      }

      return freeSlots;
    }).flat();

    // Filtrar por duração mínima se fornecida
    let filteredSlots = freeSlots;
    if (durationMinutes) {
      const minDuration = parseInt(durationMinutes as string);
      filteredSlots = freeSlots.filter(slot => slot.durationMinutes >= minDuration);
    }

    return res.json({
      provider: {
        id: provider.id,
        name: provider.user.name
      },
      period: {
        start: startDate,
        end: endDate
      },
      availableSlots: filteredSlots,
      totalSlots: filteredSlots.length
    });

  } catch (error) {
    console.error('Erro ao buscar slots disponíveis:', error);
    return res.status(500).json({
      error: 'Erro ao buscar slots disponíveis'
    });
  }
}
