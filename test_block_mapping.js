import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) return;
    
    const userId = users[0].id;
    console.log("Testing getBlockedUsers for userId:", userId);

    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
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
    });

    const blockedUsers = blocks.map((b) => ({
      id: b.blocked.id,
      name: b.blocked.profile?.name,
      photo: b.blocked.profile?.photos?.[0]?.url,
      blockedAt: b.createdAt,
    }));

    console.log("Success! Returning:", JSON.stringify(blockedUsers, null, 2));

  } catch (e) {
    console.error("PRISMA ERROR", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
