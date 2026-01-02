// chatRoutes.js
import { getIO, isUserOnline } from "../socket.js";
import prisma from "../../prisma/client.js";
// Get user's chats
export const getChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
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
        user2: {
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
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format response
    const formattedChats = chats.map((chat) => {
      const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;
      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.profile?.name,
          photo: otherUser.profile?.photos[0]?.url,
          isOnline: isUserOnline(otherUser.id),
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt,
              isRead: lastMessage.read,
              isSender: lastMessage.senderId === userId,
            }
          : null,
        unreadCount: 0, // You'll need to calculate this
        updatedAt: chat.updatedAt,
      };
    });

    res.json({ chats: formattedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const { cursor } = req.query;

    // Verify user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!chat) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json({
      messages: messages.reverse(),
      nextCursor:
        messages.length === 20 ? messages[messages.length - 1].id : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Verify user has access to this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    if (!chat) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Create message
    // In your chat controller when creating messages
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
              },
            },
          },
        },
        chat: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transform to include chatId
    const messageWithChatId = {
      ...message,
      chatId: message.chat.id,
    };

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Emit socket event
    const io = getIO();
    const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;

    // Emit to chat room
    io.to(`chat_${chatId}`).emit("new-message", messageWithChatId);

    // Emit to other user's personal room
    io.to(`user_${otherUserId}`).emit("chat-update", {
      chatId,
      lastMessage: messageWithChatId,
      timestamp: new Date(),
    });

    res.json({ success: true, messageWithChatId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
export const markRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
