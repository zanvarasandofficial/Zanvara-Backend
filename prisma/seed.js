const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        name: 'Admin',
        role: 'ADMIN',
        passwordHash,
      },
    });
    console.log(`Admin user updated: ${ADMIN_EMAIL}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
