import { PrismaClient } from '../src/generated/prisma';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (NÃO RODAR EM PRODUÇÃO)
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceVariation.deleteMany();
  await prisma.servicePhoto.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.serviceType.deleteMany();

  console.log('🗑️  Dados antigos removidos');

  // Criar tipos de serviço globais
  const serviceTypes = [
    {
      name: 'Beleza e Estética',
      description: 'Serviços de manicure, pedicure, maquiagem, cabelo, etc.'
    },
    {
      name: 'Limpeza',
      description: 'Serviços de limpeza residencial, comercial, diarista, etc.'
    },
    {
      name: 'Construção e Reforma',
      description: 'Pedreiro, pintor, eletricista, encanador, etc.'
    },
    {
      name: 'Manutenção',
      description: 'Manutenção de equipamentos, ar-condicionado, aquecedores, etc.'
    },
    {
      name: 'Jardinagem',
      description: 'Jardineiro, paisagismo, poda de árvores, etc.'
    },
    {
      name: 'Eventos',
      description: 'Fotografia, buffet, decoração, DJ, etc.'
    },
    {
      name: 'Aulas Particulares',
      description: 'Aulas de idiomas, música, reforço escolar, etc.'
    },
    {
      name: 'Saúde e Bem-estar',
      description: 'Massagem, personal trainer, nutricionista, etc.'
    },
    {
      name: 'Tecnologia',
      description: 'Manutenção de computadores, instalação de software, etc.'
    },
    {
      name: 'Automotivo',
      description: 'Mecânico, lavagem, elétrica automotiva, etc.'
    }
  ];

  for (const type of serviceTypes) {
    await prisma.serviceType.create({
      data: type
    });
  }

  console.log(`✅ ${serviceTypes.length} tipos de serviço criados!`);

  // Gerar hashes reais para as senhas
  const adminPasswordHash = await hashPassword('admin123');
  const providerPasswordHash = await hashPassword('senha123');
  const clientPasswordHash = await hashPassword('senha123');

  // Criar usuário ADMIN de exemplo
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@marketplace.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  console.log(`✅ Usuário admin criado: ${adminUser.email} (senha: admin123)`);

  // Criar usuário PRESTADOR de exemplo
  const providerUser = await prisma.user.create({
    data: {
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      password_hash: providerPasswordHash,
      phone: '11999999999',
      role: 'PROVIDER'
    }
  });

  const provider = await prisma.provider.create({
    data: {
      user_id: providerUser.id,
      bio: 'Profissional com 20 anos de experiência em manicure e pedicure.',
      document: '12345678900',
      city: 'São Paulo',
      state: 'SP'
    }
  });

  console.log(`✅ Prestador criado: ${providerUser.name} (senha: senha123)`);

  // Criar serviço de exemplo
  const belezaType = await prisma.serviceType.findFirst({
    where: { name: 'Beleza e Estética' }
  });

  if (belezaType) {
    const service = await prisma.service.create({
      data: {
        provider_id: provider.id,
        service_type_id: belezaType.id,
        title: 'Manicure e Pedicure Profissional',
        description: 'Serviço de manicure e pedicure com profissional experiente. Atendimento em domicílio.',
        is_active: true,
        variations: {
          create: [
            {
              name: 'Pé',
              price: 20.00,
              duration_minutes: 30
            },
            {
              name: 'Pé com pintura',
              price: 30.00,
              duration_minutes: 60
            },
            {
              name: 'Mãos',
              price: 25.50,
              duration_minutes: 30
            },
            {
              name: 'Mãos com pintura',
              price: 35.00,
              duration_minutes: 60
            }
          ]
        }
      }
    });

    console.log(`✅ Serviço de exemplo criado: ${service.title}`);
  }

  // Criar usuário CLIENT de exemplo
  const clientUser = await prisma.user.create({
    data: {
      name: 'João Santos',
      email: 'joao@exemplo.com',
      password_hash: clientPasswordHash,
      phone: '11988888888',
      role: 'CLIENT'
    }
  });

  console.log(`✅ Cliente criado: ${clientUser.name} (senha: senha123)`);

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
