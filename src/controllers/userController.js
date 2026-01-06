import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all users with profiles
export const getAllUsers = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { phone: { contains: search, mode: "insensitive" } },
        {
          profile: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where,
        select: {
          id: true,
          phone: true,
          isVerified: true,
          premiumStatus: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              name: true,
              age: true,
              gender: true,
              occupation: true,
              currentStep: true,
            },
          },
          kyc: {
            select: {
              id: true,
              status: true,
              step: true,
              idType: true,
              createdAt: true,
              submittedAt: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where: where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Get user by ID with details
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        phone: true,
        firebaseUid: true,
        isVerified: true,
        premiumStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            occupation: true,
            bio: true,
            budgetMin: true,
            budgetMax: true,
            preferredAreas: true,
            moveInDate: true,
            sleepHabit: true,
            cleanliness: true,
            smoking: true,
            drinking: true,
            pets: true,
            socialVibe: true,
            currentStep: true,
            lastSeen: true,
            photos: {
              select: {
                id: true,
                url: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        kyc: {
          select: {
            id: true,
            idType: true,
            idFrontUrl: true,
            idBackUrl: true,
            selfieUrl: true,
            status: true,
            step: true,
            rejectionReason: true,
            submittedAt: true,
            reviewedAt: true,
            reviewerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user details",
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerified, premiumStatus } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedData = {};
    if (status !== undefined) updatedData.status = status;
    if (isVerified !== undefined) updatedData.isVerified = isVerified;
    if (premiumStatus !== undefined) updatedData.premiumStatus = premiumStatus;

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updatedData,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user (soft delete or hard delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user and related data (cascade delete)
    await prisma.user.delete({
      where: { id: id },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      pendingUsers,
      flaggedUsers,
      premiumUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "VERIFIED" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { status: "FLAGGED" } }),
      prisma.user.count({ where: { premiumStatus: { not: "FREE" } } }),
    ]);

    // Get new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLast7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get users by gender
    const usersByGender = await prisma.profile.groupBy({
      by: ["gender"],
      _count: {
        gender: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        pendingUsers,
        flaggedUsers,
        premiumUsers,
        newUsersLast7Days,
        usersByGender,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
    });
  }
};

// Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const { gender, minAge, maxAge, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (gender) {
      where.gender = gender;
    }

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge);
      if (maxAge) where.age.lte = parseInt(maxAge);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { occupation: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: where,
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          occupation: true,
          bio: true,
          budgetMin: true,
          budgetMax: true,
          preferredAreas: true,
          currentStep: true,
          lastSeen: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              phone: true,
              status: true,
              premiumStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: parseInt(limit),
      }),
      prisma.profile.count({ where: where }),
    ]);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profiles",
    });
  }
};
