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
