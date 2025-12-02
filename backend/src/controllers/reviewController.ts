import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/reviews
 * Criar avaliação para um serviço (apenas CLIENT que tenha booking COMPLETED)
 */
export async function createReview(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { bookingId, rating, comment } = req.body;

    // Validações básicas
    if (!bookingId || !rating) {
      return res.status(400).json({
        error: 'bookingId e rating são obrigatórios'
      });
    }

    // Validar rating (1 a 5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        error: 'Rating deve ser um número inteiro entre 1 e 5'
      });
    }

    // Validar comment se fornecido
    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.length < 10 || comment.length > 500) {
        return res.status(400).json({
          error: 'Comentário deve ter entre 10 e 500 caracteres'
        });
      }
    }

    // Buscar booking e verificar permissões
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        service: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Agendamento não encontrado'
      });
    }

    // Verificar se o booking pertence ao usuário
    if (booking.client_id !== userId) {
      return res.status(403).json({
        error: 'Você não pode avaliar um agendamento de outro cliente'
      });
    }

    // Verificar se o booking está COMPLETED
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Apenas agendamentos concluídos podem ser avaliados',
        currentStatus: booking.status
      });
    }

    // Verificar se já existe review para este booking
    const existingReview = await prisma.review.findUnique({
      where: { booking_id: booking.id }
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'Você já avaliou este agendamento. Use PUT /api/reviews/:id para atualizar.'
      });
    }

    // Criar review
    const review = await prisma.review.create({
      data: {
        booking_id: booking.id,
        service_id: booking.service_id,
        client_id: userId!,
        rating,
        comment: comment || null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            title: true
          }
        },
        booking: {
          select: {
            id: true,
            start_datetime: true,
            end_datetime: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Avaliação criada com sucesso',
      review
    });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return res.status(500).json({
      error: 'Erro ao criar avaliação'
    });
  }
}

/**
 * GET /api/reviews/service/:serviceId
 * Listar avaliações de um serviço (rota pública)
 */
export async function getServiceReviews(req: Request, res: Response) {
  try {
    const { serviceId } = req.params;
    const { page = '1', limit = '20', minRating, maxRating } = req.query;

    // Construir filtro
    const where: any = {
      service_id: parseInt(serviceId)
    };

    // Filtrar por rating
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating.gte = parseInt(minRating as string);
      if (maxRating) where.rating.lte = parseInt(maxRating as string);
    }

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Buscar reviews e estatísticas
    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          },
          booking: {
            select: {
              id: true,
              start_datetime: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.review.count({ where }),
      // Calcular estatísticas de rating
      prisma.review.groupBy({
        by: ['rating'],
        where: { service_id: parseInt(serviceId) },
        _count: {
          rating: true
        }
      })
    ]);

    // Calcular rating médio e distribuição
    const totalReviews = stats.reduce((sum, stat) => sum + stat._count.rating, 0);
    const sumRatings = stats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0);
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    // Criar distribuição de estrelas
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    stats.forEach(stat => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count.rating;
    });

    return res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      statistics: {
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return res.status(500).json({
      error: 'Erro ao buscar avaliações'
    });
  }
}

/**
 * GET /api/reviews/my
 * Listar minhas avaliações (CLIENT autenticado)
 */
export async function getMyReviews(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { page = '1', limit = '20' } = req.query;

    // Paginação
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Buscar reviews do cliente
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { client_id: userId },
        include: {
          service: {
            select: {
              id: true,
              title: true,
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
          },
          booking: {
            select: {
              id: true,
              start_datetime: true,
              end_datetime: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.review.count({ where: { client_id: userId } })
    ]);

    return res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar minhas avaliações:', error);
    return res.status(500).json({
      error: 'Erro ao buscar avaliações'
    });
  }
}

/**
 * GET /api/reviews/:id
 * Buscar detalhes de uma avaliação específica (rota pública)
 */
export async function getReviewById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
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
            id: true,
            title: true,
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
        },
        booking: {
          select: {
            id: true,
            start_datetime: true,
            end_datetime: true,
            status: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        error: 'Avaliação não encontrada'
      });
    }

    return res.json(review);

  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    return res.status(500).json({
      error: 'Erro ao buscar avaliação'
    });
  }
}

/**
 * PUT /api/reviews/:id
 * Atualizar avaliação (apenas o dono CLIENT)
 */
export async function updateReview(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Buscar review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({
        error: 'Avaliação não encontrada'
      });
    }

    // Verificar ownership
    if (review.client_id !== userId) {
      return res.status(403).json({
        error: 'Você não pode editar a avaliação de outro cliente'
      });
    }

    // Validar rating se fornecido
    if (rating !== undefined) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({
          error: 'Rating deve ser um número inteiro entre 1 e 5'
        });
      }
    }

    // Validar comment se fornecido
    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.length < 10 || comment.length > 500) {
        return res.status(400).json({
          error: 'Comentário deve ter entre 10 e 500 caracteres'
        });
      }
    }

    // Atualizar review
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            title: true
          }
        },
        booking: {
          select: {
            id: true,
            start_datetime: true
          }
        }
      }
    });

    return res.json({
      message: 'Avaliação atualizada com sucesso',
      review: updatedReview
    });

  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar avaliação'
    });
  }
}

/**
 * DELETE /api/reviews/:id
 * Deletar avaliação (apenas o dono CLIENT)
 */
export async function deleteReview(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Buscar review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({
        error: 'Avaliação não encontrada'
      });
    }

    // Verificar ownership
    if (review.client_id !== userId) {
      return res.status(403).json({
        error: 'Você não pode deletar a avaliação de outro cliente'
      });
    }

    // Deletar review
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      message: 'Avaliação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    return res.status(500).json({
      error: 'Erro ao deletar avaliação'
    });
  }
}
