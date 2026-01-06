import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// STEP 1: Start KYC Process
export const startKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const { idType } = req.body;

    if (!idType) {
      return res.status(400).json({
        success: false,
        message: "ID type is required",
      });
    }

    // Check for existing pending KYC
    const existingKYC = await prisma.kYCDocument.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
      },
    });

    if (existingKYC) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending KYC submission",
        data: existingKYC,
      });
    }

    // Create new KYC document
    const kyc = await prisma.kYCDocument.create({
      data: {
        userId: userId,
        idType: idType,
        status: "PENDING",
        step: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "KYC process started",
      kyc: kyc,
    });
  } catch (error) {
    console.error("Start KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start KYC process",
    });
  }
};

// STEP 2: Upload ID Front
export const uploadIDFront = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kycId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ID front image is required",
      });
    }

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required",
      });
    }

    // Verify KYC belongs to user
    const kyc = await prisma.kYCDocument.findFirst({
      where: {
        id: kycId,
        userId: userId,
        status: "PENDING",
      },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found or not pending",
      });
    }

    // Update KYC with ID front URL
    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: {
        idFrontUrl: req.file.location,
        step: 2, // Move to next step (ID back)
      },
    });

    res.json({
      success: true,
      message: "ID front uploaded successfully",
      kyc: updatedKYC,
    });
  } catch (error) {
    console.error("Upload ID front error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload ID front",
    });
  }
};

// STEP 3: Upload ID Back (Optional)
export const uploadIDBack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kycId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ID back image is required",
      });
    }

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required",
      });
    }

    // Verify KYC belongs to user
    const kyc = await prisma.kYCDocument.findFirst({
      where: {
        id: kycId,
        userId: userId,
        status: "PENDING",
      },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found or not pending",
      });
    }

    // Check if ID front is uploaded
    if (!kyc.idFrontUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload ID front first",
      });
    }

    // Update KYC with ID back URL
    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: {
        idBackUrl: req.file.location,
        step: 3, // Move to next step (selfie)
      },
    });

    res.json({
      success: true,
      message: "ID back uploaded successfully",
      kyc: updatedKYC,
    });
  } catch (error) {
    console.error("Upload ID back error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload ID back",
    });
  }
};

// STEP 4: Upload Selfie
export const uploadSelfie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kycId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie image is required",
      });
    }

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required",
      });
    }

    // Verify KYC belongs to user
    const kyc = await prisma.kYCDocument.findFirst({
      where: {
        id: kycId,
        userId: userId,
        status: "PENDING",
      },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found or not pending",
      });
    }

    // Check if ID front is uploaded
    if (!kyc.idFrontUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload ID front first",
      });
    }

    // Update KYC with selfie URL
    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: {
        selfieUrl: req.file.location,
        step: 4, // All files uploaded
      },
    });

    res.json({
      success: true,
      message: "Selfie uploaded successfully",
      kyc: updatedKYC,
    });
  } catch (error) {
    console.error("Upload selfie error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload selfie",
    });
  }
};

// STEP 5: Submit KYC for Review
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kycId } = req.body;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required",
      });
    }

    // Verify KYC belongs to user
    const kyc = await prisma.kYCDocument.findFirst({
      where: {
        id: kycId,
        userId: userId,
        status: "PENDING",
      },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found or not pending",
      });
    }

    // Check if all required files are uploaded
    if (!kyc.idFrontUrl || !kyc.selfieUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload ID front and selfie before submitting",
      });
    }

    // Submit KYC for review
    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: kycId },
      data: {
        isSubmitted: true,
        submittedAt: new Date(),
        step: 5, // Submitted for review
      },
    });

    res.json({
      success: true,
      message: "KYC submitted for review successfully",
      kyc: updatedKYC,
    });
  } catch (error) {
    console.error("Submit KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit KYC for review",
    });
  }
};

// Get KYC status
export const getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const kyc = await prisma.kYCDocument.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "No KYC submission found",
      });
    }

    res.json({
      success: true,
      kyc: kyc,
    });
  } catch (error) {
    console.error("Get KYC status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get KYC status",
    });
  }
};

// ADMIN: Get all KYCs
export const getAllKYCs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [kycs, total] = await Promise.all([
      prisma.kYCDocument.findMany({
        where: where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              createdAt: true,
              profile: {
                select: {
                  name: true,
                  gender: true,
                  age: true,
                  occupation: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: parseInt(limit),
      }),
      prisma.kYCDocument.count({ where: where }),
    ]);

    res.json({
      success: true,
      data: kycs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all KYCs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get KYCs",
    });
  }
};

// ADMIN: Get KYC by ID
export const getKYCById = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await prisma.kYCDocument.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            createdAt: true,
            profile: {
              select: {
                name: true,
                gender: true,
                age: true,
                occupation: true,
              },
            },
          },
        },
      },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    res.json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    console.error("Get KYC by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get KYC details",
    });
  }
};

// ADMIN: Approve KYC
export const approveKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewedBy = req.user.id;

    const kyc = await prisma.kYCDocument.findUnique({
      where: { id: id },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    if (kyc.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "KYC is not pending",
      });
    }

    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: id },
      data: {
        status: "VERIFIED",
        reviewedAt: new Date(),
        reviewedBy: reviewedBy,
        rejectionReason: "",
      },
    });
    await prisma.user.update({
      where: { id: kyc.userId },
      data: {
        status: "VERIFIED",
      },
    });

    res.json({
      success: true,
      message: "KYC approved successfully",
      data: updatedKYC,
    });
  } catch (error) {
    console.error("Approve KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve KYC",
    });
  }
};

// ADMIN: Reject KYC
export const rejectKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const reviewedBy = req.user.id;

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const kyc = await prisma.kYCDocument.findUnique({
      where: { id: id },
    });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC not found",
      });
    }

    if (kyc.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "KYC is not pending",
      });
    }

    const updatedKYC = await prisma.kYCDocument.update({
      where: { id: id },
      data: {
        status: "FLAGGED",
        rejectionReason: rejectionReason,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy,
      },
    });
    await prisma.user.update({
      where: { id: kyc.userId },
      data: {
        status: "FLAGGED",
      },
    });
    res.json({
      success: true,
      message: "KYC FLAGGED successfully",
      data: updatedKYC,
    });
  } catch (error) {
    console.error("Reject KYC error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject KYC",
    });
  }
};

// Get KYC statistics
export const getKYCStats = async (req, res) => {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count
      FROM "KYCDocument"
      GROUP BY status
      ORDER BY status
    `;

    const totalSubmitted = await prisma.kYCDocument.count({
      where: { isSubmitted: true },
    });

    const totalPending = await prisma.kYCDocument.count({
      where: {
        status: "PENDING",
      },
    });

    const todaySubmissions = await prisma.kYCDocument.count({
      where: {
        submittedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    res.json({
      success: true,
      data: {
        stats: stats,
        totalSubmitted: totalSubmitted,
        totalPending: totalPending,
        todaySubmissions: todaySubmissions,
      },
    });
  } catch (error) {
    console.error("Get KYC stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get KYC stats",
    });
  }
};
