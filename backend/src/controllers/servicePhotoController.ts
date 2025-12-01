import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import cloudinary from '../config/cloudinary';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * POST /api/services/:id/photos
 * Upload de foto do serviço para Cloudinary (apenas o dono)
 */
export async function uploadPhoto(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { isCover } = req.body;
    const file = req.file;

    // Validação
    if (!file) {
      return res.status(400).json({
        error: 'Arquivo de imagem é obrigatório'
      });
    }

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { user_id: userId }
    });

    if (!provider) {
      // Deletar arquivo temporário
      fs.unlinkSync(file.path);
      return res.status(404).json({
        error: 'Perfil de prestador não encontrado'
      });
    }

    // Verificar se o serviço existe e pertence ao provider
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      // Deletar arquivo temporário
      fs.unlinkSync(file.path);
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    if (service.provider_id !== provider.id) {
      // Deletar arquivo temporário
      fs.unlinkSync(file.path);
      return res.status(403).json({
        error: 'Você não tem permissão para adicionar fotos a este serviço'
      });
    }

    // Se marcar como capa, desmarcar todas as outras
    if (isCover === 'true' || isCover === true) {
      await prisma.servicePhoto.updateMany({
        where: {
          service_id: parseInt(id),
          is_cover: true
        },
        data: {
          is_cover: false
        }
      });
    }

    // Upload para Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'Service-Marketplace',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Limitar tamanho máximo
        { quality: 'auto' }, // Otimizar qualidade automaticamente
        { fetch_format: 'auto' } // Formato otimizado (webp quando possível)
      ]
    });

    // Deletar arquivo temporário após upload
    fs.unlinkSync(file.path);

    // Salvar no banco de dados
    const photo = await prisma.servicePhoto.create({
      data: {
        service_id: parseInt(id),
        url: uploadResult.secure_url,
        is_cover: isCover === 'true' || isCover === true || false
      }
    });

    return res.status(201).json({
      message: 'Foto enviada com sucesso',
      photo: {
        ...photo,
        cloudinary_public_id: uploadResult.public_id
      }
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    
    // Tentar deletar arquivo temporário em caso de erro
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao deletar arquivo temporário:', unlinkError);
      }
    }
    
    return res.status(500).json({
      error: 'Erro ao fazer upload da foto'
    });
  }
}

/**
 * PUT /api/services/:id/photos/:photoId/cover
 * Marcar foto como capa (apenas o dono)
 */
export async function setCoverPhoto(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id, photoId } = req.params;

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
        error: 'Você não tem permissão para editar fotos deste serviço'
      });
    }

    // Verificar se a foto existe e pertence ao serviço
    const photo = await prisma.servicePhoto.findUnique({
      where: { id: parseInt(photoId) }
    });

    if (!photo) {
      return res.status(404).json({
        error: 'Foto não encontrada'
      });
    }

    if (photo.service_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Esta foto não pertence ao serviço informado'
      });
    }

    // Desmarcar todas as fotos como capa
    await prisma.servicePhoto.updateMany({
      where: {
        service_id: parseInt(id),
        is_cover: true
      },
      data: {
        is_cover: false
      }
    });

    // Marcar esta foto como capa
    const updatedPhoto = await prisma.servicePhoto.update({
      where: { id: parseInt(photoId) },
      data: { is_cover: true }
    });

    return res.json({
      message: 'Foto de capa atualizada com sucesso',
      photo: updatedPhoto
    });

  } catch (error) {
    console.error('Erro ao definir foto de capa:', error);
    return res.status(500).json({
      error: 'Erro ao definir foto de capa'
    });
  }
}

/**
 * DELETE /api/services/:id/photos/:photoId
 * Deletar foto do serviço (apenas o dono)
 */
export async function deletePhoto(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id, photoId } = req.params;

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
        error: 'Você não tem permissão para deletar fotos deste serviço'
      });
    }

    // Verificar se a foto existe e pertence ao serviço
    const photo = await prisma.servicePhoto.findUnique({
      where: { id: parseInt(photoId) }
    });

    if (!photo) {
      return res.status(404).json({
        error: 'Foto não encontrada'
      });
    }

    if (photo.service_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Esta foto não pertence ao serviço informado'
      });
    }

    // Extrair public_id da URL do Cloudinary
    // URL formato: https://res.cloudinary.com/defsqk3jc/image/upload/v1234567890/Service-Marketplace/abcd1234.jpg
    const urlParts = photo.url.split('/');
    const filename = urlParts[urlParts.length - 1].split('.')[0]; // abcd1234
    const folder = process.env.CLOUDINARY_FOLDER || 'Service-Marketplace';
    const publicId = `${folder}/${filename}`;

    // Deletar do Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error('Erro ao deletar do Cloudinary:', cloudinaryError);
      // Continuar mesmo se falhar no Cloudinary
    }

    // Deletar do banco de dados
    await prisma.servicePhoto.delete({
      where: { id: parseInt(photoId) }
    });

    return res.json({
      message: 'Foto deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return res.status(500).json({
      error: 'Erro ao deletar foto'
    });
  }
}
