import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const blockCount = await prisma.block.count();
    const blocks = await prisma.block.findMany();
    const users = await prisma.user.findMany({ select: { id: true, phone: true } });
    console.log("Blocks Count:", blockCount);
    console.log("Blocks:", blocks);
    console.log("Users Count:", users.length);
  } catch (e) {
    console.error("PRISMA ERROR", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
