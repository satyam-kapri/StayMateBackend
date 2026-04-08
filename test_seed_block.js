import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const reportCount = await prisma.report.count();
    const reports = await prisma.report.findMany();
    console.log("Reports Count:", reportCount);
    console.log("Reports:", reports);
    
    // Seed a block to test if it works
    const users = await prisma.user.findMany({ take: 2 });
    if (users.length >= 2) {
      const b = await prisma.block.create({
        data: {
          blockerId: users[0].id,
          blockedId: users[1].id
        }
      });
      console.log("Created test block:", b);
    }
  } catch (e) {
    console.error("PRISMA ERROR", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
