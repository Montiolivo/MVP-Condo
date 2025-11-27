import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const usuario = await prisma.usuario.upsert({
    where: { email: 'teste@condominio.com' },
    update: {},
    create: {
      nome: 'Usuário de Teste',
      email: 'teste@condominio.com'
    }
  });

  console.log('✅ Usuário criado:', {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email
  });

  console.log('\n📝 Use este ID para fazer upload: ' + usuario.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
