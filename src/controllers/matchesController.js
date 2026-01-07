import prisma from "../../prisma/client.js";
import { calculateCompatibility } from "../utils/compatibility.js";

// Emit socket event for new chat creation
import { getIO, getUserSocketId } from "../socket.js";
/**
 * GET MATCH FEED
 * No DB writes
 */
export const getMatchFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filters = req.query;

    const me = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!me?.profile) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    // Users already interacted with
    const interactions = await prisma.match.findMany({
      where: {
        requesterId: userId,
      },
      select: { requesterId: true, receiverId: true },
    });

    const excludedIds = new Set(
      interactions.flatMap((i) => [i.requesterId, i.receiverId])
    );
    excludedIds.add(userId);

    // Build profile where conditions
    const profileWhereConditions = {
      userId: { notIn: Array.from(excludedIds) },
      // user: { isVerified: true },
    };

    // Add filters
    if (filters.gender) {
      profileWhereConditions.gender = filters.gender;
    }

    if (filters.preferredAreas) {
      const areas = Array.isArray(filters.preferredAreas)
        ? filters.preferredAreas
        : [filters.preferredAreas];
      profileWhereConditions.preferredAreas = {
        hasSome: areas,
      };
    }

    if (filters.budgetMin) {
      profileWhereConditions.budgetMin = { gte: parseFloat(filters.budgetMin) };
    }

    if (filters.budgetMax) {
      profileWhereConditions.budgetMax = { lte: parseFloat(filters.budgetMax) };
    }

    if (filters.moveInDate) {
      const targetDate = new Date(filters.moveInDate);
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 7);

      profileWhereConditions.moveInDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const profiles = await prisma.profile.findMany({
      where: profileWhereConditions,
      include: {
        user: {
          select: {
            id: true,
            isVerified: true,
          },
        },
        photos: true,
      },
    });

    const feed = profiles
      .map((p) => ({
        userId: p.userId,
        profile: p,
        compatibilityScore: calculateCompatibility(me.profile, p),
      }))
      // .filter((x) => x.compatibilityScore >= 10)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 50);

    res.json({ success: true, feed });
  } catch (err) {
    console.error("Feed generation error:", err);
    res.status(500).json({ message: "Feed generation failed" });
  }
};
/**
 * RESPOND TO MATCH (CONNECT / SKIP)
 */
// In your match controller
export const respondToMatch = async (req, res) => {
  try {
    const { targetUserId, action, compatibilityScore } = req.body;
    const userId = req.user.userId;
    const status = action === "CONNECT" ? "CONNECTED" : "SKIPPED";

    await prisma.match.create({
      data: {
        requesterId: userId,
        receiverId: targetUserId,
        compatibilityScore,
        status,
      },
    });

    // Check mutual connection
    const reverse = await prisma.match.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: targetUserId,
          receiverId: userId,
        },
      },
    });

    const isMutual =
      reverse && reverse.status === "CONNECTED" && status === "CONNECTED";

    // If mutual connection, create chat and admin message
    if (isMutual) {
      // Create chat between users
      const chat = await prisma.chat.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId,
        },
      });

      // Create admin welcome message
      const adminMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: "c1f6d9e0-f792-4e1d-81b0-d962a44b840f", // Or use a system user ID
          content:
            "🎉 You are now connected! Say hello and start your conversation.",
          read: false,
          isAdminMessage: true,
        },
      });
      const io = getIO();
      // Get users' sockets
      const user1SocketId = getUserSocketId(userId);
      const user2SocketId = getUserSocketId(targetUserId);

      // Create chat data for response
      const chatWithUsers = await prisma.chat.findUnique({
        where: { id: chat.id },
        include: {
          user1: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  photos: true,
                },
              },
            },
          },
          user2: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  photos: true,
                },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      // Notify both users about new chat
      if (user1SocketId) {
        io.to(user1SocketId).emit("new-chat", chatWithUsers);
      }
      if (user2SocketId) {
        io.to(user2SocketId).emit("new-chat", chatWithUsers);
      }
    }

    res.json({
      success: true,
      isMutual,
      message: isMutual
        ? "Match successful! Chat room has been created."
        : "Response recorded.",
    });
  } catch (error) {
    console.error("Error in respondToMatch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET CONNECTED MATCHES
 */
export const getConnectedMatches = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Fetch all connected matches where the user is involved
    const allMatches = await prisma.match.findMany({
      where: {
        status: "CONNECTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            isVerified: true,
            profile: { select: { name: true, gender: true, photos: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            isVerified: true,
            profile: { select: { name: true, gender: true, photos: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Separate them based on the user's role
    const requested = allMatches.filter(
      (match) => match.requesterId === userId
    );
    const received = allMatches.filter((match) => match.receiverId === userId);

    res.json({
      success: true,
      matches: {
        requested, // Matches the user initiated
        received, // Matches the user accepted
      },
    });
  } catch (err) {
    console.error("Error fetching connected matches:", err);
    res.status(500).json({ message: "Fetch connected matches failed" });
  }
};
