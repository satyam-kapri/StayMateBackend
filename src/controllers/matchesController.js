import prisma from "../../prisma/client.js";
import { calculateCompatibility } from "../utils/compatibility.js";

// Emit socket event for new chat creation
import { getIO, getUserSocketId } from "../socket.js";
/**
 * GET MATCH FEED
 * No DB writes
 */
// export const getMatchFeed = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const filters = req.query;

//     const me = await prisma.user.findUnique({
//       where: { id: userId },
//       include: { profile: true },
//     });

//     if (!me?.profile) {
//       return res.status(400).json({ message: "Complete profile first" });
//     }

//     // Users already interacted with
//     const interactions = await prisma.match.findMany({
//       where: {
//         requesterId: userId,
//       },
//       select: { requesterId: true, receiverId: true },
//     });

//     const excludedIds = new Set(
//       interactions.flatMap((i) => [i.requesterId, i.receiverId])
//     );
//     excludedIds.add(userId);

//     // Build profile where conditions
//     const profileWhereConditions = {
//       userId: { notIn: Array.from(excludedIds) },
//       // user: { isVerified: true },
//     };

//     // Add filters
//     if (filters.gender) {
//       profileWhereConditions.gender = filters.gender;
//     }

//     if (filters.preferredAreas) {
//       const areas = Array.isArray(filters.preferredAreas)
//         ? filters.preferredAreas
//         : [filters.preferredAreas];
//       profileWhereConditions.preferredAreas = {
//         hasSome: areas,
//       };
//     }

//     if (filters.budgetMin) {
//       profileWhereConditions.budgetMin = { gte: parseFloat(filters.budgetMin) };
//     }

//     if (filters.budgetMax) {
//       profileWhereConditions.budgetMax = { lte: parseFloat(filters.budgetMax) };
//     }

//     if (filters.moveInDate) {
//       const targetDate = new Date(filters.moveInDate);
//       const startDate = new Date(targetDate);
//       startDate.setDate(startDate.getDate() - 7);
//       const endDate = new Date(targetDate);
//       endDate.setDate(endDate.getDate() + 7);

//       profileWhereConditions.moveInDate = {
//         gte: startDate,
//         lte: endDate,
//       };
//     }

//     const profiles = await prisma.profile.findMany({
//       where: profileWhereConditions,
//       include: {
//         user: {
//           select: {
//             id: true,
//             isVerified: true,
//           },
//         },
//         photos: true,
//       },
//     });

//     const feed = profiles
//       .map((p) => ({
//         userId: p.userId,
//         profile: p,
//         compatibilityScore: calculateCompatibility(me.profile, p),
//       }))
//       // .filter((x) => x.compatibilityScore >= 10)
//       .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
//       .slice(0, 50);

//     res.json({ success: true, feed });
//   } catch (err) {
//     console.error("Feed generation error:", err);
//     res.status(500).json({ message: "Feed generation failed" });
//   }
// };
export const getMatchFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filters = req.query;

    // Get current user with profile and lifestyle responses
    const me = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            questionResponses: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    if (!me?.profile) {
      return res.status(400).json({ message: "Complete profile first" });
    }

    // Users already interacted with
    const interactions = await prisma.match.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      select: { requesterId: true, receiverId: true },
    });

    const excludedIds = new Set(
      interactions.flatMap((i) => [i.requesterId, i.receiverId]),
    );
    excludedIds.add(userId);

    // Get all lifestyle questions with weights
    const lifestyleQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        category: { name: "Lifestyle Survey" },
      },
    });

    // Build where conditions for columns
    const whereConditions = {
      userId: { notIn: Array.from(excludedIds) },
      user: { isVerified: true },
    };

    // Add column filters
    if (filters.gender) {
      whereConditions.gender = filters.gender;
    }

    if (filters.preferredAreas) {
      const areas = Array.isArray(filters.preferredAreas)
        ? filters.preferredAreas
        : [filters.preferredAreas];
      whereConditions.preferredAreas = {
        hasSome: areas,
      };
    }

    if (filters.budgetMin) {
      whereConditions.budgetMin = { gte: parseFloat(filters.budgetMin) };
    }

    if (filters.budgetMax) {
      whereConditions.budgetMax = { lte: parseFloat(filters.budgetMax) };
    }

    if (filters.moveInDate) {
      const targetDate = new Date(filters.moveInDate);
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 15); // ±15 days
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 15);

      whereConditions.moveInDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get potential matches with their lifestyle responses
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        isVerified: true,
      },
      include: {
        profile: {
          include: {
            questionResponses: {
              include: {
                question: true,
              },
            },
            photos: true,
          },
        },
      },
    });

    // Filter by column conditions in JavaScript
    const filteredUsers = potentialMatches.filter((user) => {
      if (!user.profile) return false;

      // Apply column filters
      if (filters.gender && user.profile.gender !== filters.gender)
        return false;

      if (filters.preferredAreas) {
        const areas = Array.isArray(filters.preferredAreas)
          ? filters.preferredAreas
          : [filters.preferredAreas];
        const hasCommonArea = areas.some((area) =>
          user.profile.preferredAreas.includes(area),
        );
        if (!hasCommonArea) return false;
      }

      if (
        filters.budgetMin &&
        user.profile.budgetMin < parseFloat(filters.budgetMin)
      ) {
        return false;
      }

      if (
        filters.budgetMax &&
        user.profile.budgetMax > parseFloat(filters.budgetMax)
      ) {
        return false;
      }

      if (filters.moveInDate) {
        const targetDate = new Date(filters.moveInDate);
        const userDate = new Date(user.profile.moveInDate);
        const diffDays = Math.abs(
          (targetDate - userDate) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 15) return false;
      }

      return true;
    });

    // Calculate compatibility for each user
    const feed = filteredUsers
      .map((user) => ({
        userId: user.id,
        profile: user.profile,
        compatibilityScore: calculateCompatibility(
          me.profile,
          user.profile,
          lifestyleQuestions,
        ),
      }))
      .filter((item) => item.compatibilityScore >= 30) // Minimum 30% compatibility
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 50);

    res.json({ success: true, feed });
  } catch (err) {
    console.error("Feed generation error:", err);
    res.status(500).json({ message: "Feed generation failed" });
  }
};

// Compatibility calculation
function calculateCompatibility(me, other, lifestyleQuestions) {
  let totalScore = 0;
  let maxScore = 0;

  // 1. Budget compatibility (30% weight)
  if (me.budgetMax >= other.budgetMin && other.budgetMax >= me.budgetMin) {
    const overlap =
      Math.min(me.budgetMax, other.budgetMax) -
      Math.max(me.budgetMin, other.budgetMin);
    const totalRange =
      Math.max(me.budgetMax, other.budgetMax) -
      Math.min(me.budgetMin, other.budgetMin);
    if (totalRange > 0) {
      const budgetScore = (overlap / totalRange) * 30;
      totalScore += budgetScore;
    }
  }
  maxScore += 30;

  // 2. Location compatibility (20% weight)
  if (me.preferredAreas.length > 0 && other.preferredAreas.length > 0) {
    const commonAreas = me.preferredAreas.filter((area) =>
      other.preferredAreas.includes(area),
    );
    const locationScore =
      (commonAreas.length /
        Math.max(me.preferredAreas.length, other.preferredAreas.length)) *
      20;
    totalScore += locationScore;
  }
  maxScore += 20;

  // 3. Move-in date compatibility (10% weight)
  if (me.moveInDate && other.moveInDate) {
    const diffDays = Math.abs(
      (new Date(me.moveInDate) - new Date(other.moveInDate)) /
        (1000 * 60 * 60 * 24),
    );
    const dateScore = Math.max(0, 10 - (diffDays / 15) * 10); // Decreases by 1/15th per day
    totalScore += dateScore;
  }
  maxScore += 10;

  // 4. Lifestyle compatibility (40% weight, distributed by question weights)
  const meResponsesMap = {};
  me.questionResponses?.forEach((r) => {
    meResponsesMap[r.questionId] = r;
  });

  const otherResponsesMap = {};
  other.questionResponses?.forEach((r) => {
    otherResponsesMap[r.questionId] = r;
  });

  let lifestyleWeightTotal = 0;
  let lifestyleScore = 0;

  for (const question of lifestyleQuestions) {
    const myResponse = meResponsesMap[question.id];
    const otherResponse = otherResponsesMap[question.id];

    if (myResponse && otherResponse) {
      const matchScore = calculateLifestyleMatch(
        myResponse,
        otherResponse,
        question.type,
      );
      const questionWeight = question.weight || 1;

      lifestyleScore += matchScore * questionWeight;
      lifestyleWeightTotal += questionWeight;
    }
  }

  if (lifestyleWeightTotal > 0) {
    const normalizedLifestyleScore =
      (lifestyleScore / lifestyleWeightTotal) * 40;
    totalScore += normalizedLifestyleScore;
  }
  maxScore += 40;

  // Return percentage score
  return Math.round((totalScore / maxScore) * 100);
}

function calculateLifestyleMatch(myResponse, otherResponse, questionType) {
  switch (questionType) {
    case "TEXT":
    case "RADIO":
      return myResponse.textValue === otherResponse.textValue ||
        myResponse.selectedOptions?.[0] === otherResponse.selectedOptions?.[0]
        ? 1
        : 0;

    case "MULTI_SELECT":
      const myOptions = myResponse.selectedOptions || [];
      const otherOptions = otherResponse.selectedOptions || [];
      const common = myOptions.filter((opt) => otherOptions.includes(opt));
      const total = new Set([...myOptions, ...otherOptions]).size;
      return total > 0 ? common.length / total : 0;

    case "NUMBER":
      const myNum = myResponse.numberValue || 0;
      const otherNum = otherResponse.numberValue || 0;
      const diff = Math.abs(myNum - otherNum);
      const maxNum = Math.max(myNum, otherNum);
      return maxNum > 0 ? Math.max(0, 1 - diff / maxNum) : 0.5;

    case "DATE":
      const myDate = new Date(myResponse.dateValue);
      const otherDate = new Date(otherResponse.dateValue);
      const diffDays = Math.abs((myDate - otherDate) / (1000 * 60 * 60 * 24));
      return Math.max(0, 1 - diffDays / 30);

    default:
      return 0.5;
  }
}

/**
 * RESPOND TO MATCH (CONNECT / SKIP)
 */
// In your match controller
export const respondToMatch = async (req, res) => {
  try {
    const { targetUserId, action, compatibilityScore } = req.body;
    const userId = req.user.userId;

    const status = action === "CONNECT" ? "CONNECTED" : "SKIPPED";
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (action === "CONNECT" && user.status !== "VERIFIED") {
      res
        .status(400)
        .json({ success: false, message: "Complete Verification First!" });
      return;
    }
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
          senderId: "adminid123", // Or use a system user ID
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
      (match) => match.requesterId === userId,
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
