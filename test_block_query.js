import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const blocks = await prisma.block.findMany({
      include: {
        blocked: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                photos: { take: 1 },
              },
            },
          },
        },
      },
      take: 1
    });
    console.log(JSON.stringify(blocks, null, 2));
  } catch (e) {
    console.error("PRISMA ERROR", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
