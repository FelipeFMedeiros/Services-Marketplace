import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * GET /api/service-types
 * Lista todos os tipos de serviço disponíveis
 */
export async function getAllServiceTypes(req: Request, res: Response): Promise<void> {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            services: true // Conta quantos serviços existem deste tipo
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        serviceTypes,
        total: serviceTypes.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tipos de serviço.'
    });
  }
}

/**
 * GET /api/service-types/:id
 * Busca um tipo de serviço específico
 */
export async function getServiceTypeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const serviceType = await prisma.serviceType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!serviceType) {
      res.status(404).json({
        success: false,
        message: 'Tipo de serviço não encontrado.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        serviceType
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tipo de serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tipo de serviço.'
    });
  }
}
