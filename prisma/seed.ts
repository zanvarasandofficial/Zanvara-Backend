import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed complete. No default admin user is created.');
  console.log('Create an account at /dashboard/admin/login, then run:');
  console.log('  npm run promote-admin -- your-email@example.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
