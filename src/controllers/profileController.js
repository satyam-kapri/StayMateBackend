// import prisma from "../../prisma/client.js";
// import fs from "fs";
// /**
//  * Helper: create profile if not exists
//  */
// const getOrCreateProfile = async (userId) => {
//   return prisma.profile.upsert({
//     where: { userId },
//     update: {},
//     create: {
//       userId,
//       name: "",
//       age: 0,
//       gender: "MALE",
//       budgetMin: 0,
//       budgetMax: 0,
//       preferredAreas: [],
//     },
//   });
// };

// /**
//  * 1️⃣ BASIC INFO
//  */
// export const updateBasicInfo = async (req, res) => {
//   try {
//     const { name, age, gender, occupation, currentStep } = req.body;
//     const userId = req.user.userId;

//     await getOrCreateProfile(userId);

//     const profile = await prisma.profile.update({
//       where: { userId },
//       data: { name, age: parseInt(age), gender, occupation, currentStep },
//     });

//     res.json({ success: true, profile });
//   } catch (err) {
//     console.log(err);
//     res
//       .status(500)
//       .json({ success: false, message: "Basic info update failed" });
//   }
// };

// /**
//  * 2️⃣ BUDGET & LOCALITIES
//  */
// export const updateBudgetLocation = async (req, res) => {
//   try {
//     const { budgetMin, budgetMax, preferredAreas, moveInDate, currentStep } =
//       req.body;
//     const userId = req.user.userId;

//     const profile = await prisma.profile.update({
//       where: { userId },
//       data: {
//         budgetMin,
//         budgetMax,
//         preferredAreas,
//         moveInDate: moveInDate ? new Date(moveInDate) : null,
//         currentStep,
//       },
//     });

//     res.json({ success: true, profile });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Budget update failed" });
//   }
// };

// /**
//  * 3️⃣ LIFESTYLE (CHIPS)
//  */
// export const updateLifestyle = async (req, res) => {
//   try {
//     const {
//       sleepHabit,
//       cleanliness,
//       smoking,
//       drinking,
//       pets,
//       socialVibe,
//       currentStep,
//     } = req.body;

//     const userId = req.user.userId;

//     const profile = await prisma.profile.update({
//       where: { userId },
//       data: {
//         sleepHabit,
//         cleanliness,
//         smoking,
//         drinking,
//         pets,
//         socialVibe,
//         currentStep,
//       },
//     });

//     res.json({ success: true, profile });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ success: false, message: "Lifestyle update failed" });
//   }
// };

// /**
//  * 4️⃣ PHOTOS (ADD)
//  * expects uploadedUrls[] from cloud upload middleware
//  */
// export const uploadPhoto = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { currentStep } = req.body;
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No file uploaded." });
//     }

//     const filePath = req.file.location;

//     const profile = await prisma.profile.update({
//       where: { userId },
//       data: { currentStep: parseInt(currentStep) },
//     });

//     if (!profile) {
//       // If profile not found, delete the uploaded file
//       fs.unlinkSync(filePath); // Delete the uploaded file
//       return res
//         .status(404)
//         .json({ success: false, message: "Profile not found" });
//     }

//     const photo = await prisma.photo.create({
//       data: {
//         profileId: profile.id,
//         url: filePath, // Store the path of the uploaded file
//       },
//     });

//     res.json({
//       success: true,
//       message: "Photo uploaded successfully",
//       photoPath: filePath,
//       photoId: photo.id,
//     });
//   } catch (err) {
//     // If an error occurs, delete the uploaded file if it exists
//     if (req.file && req.file.path) {
//       fs.unlinkSync(req.file.path);
//     }
//     console.error("Error uploading photo:", err); // Log the actual error
//     res.status(500).json({
//       success: false,
//       message: "Photo upload failed",
//       error: err.message,
//     });
//   }
// };

// /**
//  * 4️⃣ PHOTOS (DELETE)
//  */
// export const deletePhoto = async (req, res) => {
//   try {
//     const { photoId } = req.params;

//     await prisma.photo.delete({
//       where: { id: photoId },
//     });

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Delete photo failed" });
//   }
// };

// /**
//  * 5️⃣ BIO
//  */
// export const updateBio = async (req, res) => {
//   try {
//     const { bio, currentStep } = req.body;
//     const userId = req.user.userId;

//     const profile = await prisma.profile.update({
//       where: { userId },
//       data: { bio, currentStep },
//     });

//     res.json({ success: true, profile });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Bio update failed" });
//   }
// };

// /**
//  * 6️⃣ GET FULL PROFILE
//  */
// export const getMyProfile = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         phone: true,
//         isVerified: true,
//         premiumStatus: true,
//         profile: {
//           select: {
//             name: true,
//             age: true,
//             occupation: true,
//             gender: true,
//             photos: true,
//           },
//         },
//       },
//     });

//     res.json({ success: true, user });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Fetch profile failed" });
//   }
// };

// export const getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!userId) {
//       res.status(400).json({
//         message: "userId not found!!",
//       });
//       return;
//     }

//     const profile = await prisma.profile.findUnique({
//       where: { userId: userId },
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

//     res.json({ success: true, profile });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Fetch profile failed" });
//   }
// };

import prisma from "../../prisma/client.js";
import fs from "fs";

/**
 * Helper: create profile if not exists
 */
const getOrCreateProfile = async (userId) => {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      name: "",
      age: 0,
      gender: "MALE",
      budgetMin: 0,
      budgetMax: 0,

    },
  });
};

/**
 * 1️⃣ BASIC INFO (Unchanged)
 */
export const updateBasicInfo = async (req, res) => {
  try {
    const { name, age, gender, occupation, currentStep } = req.body;
    const userId = req.user.userId;

    await getOrCreateProfile(userId);

    const profile = await prisma.profile.update({
      where: { userId },
      data: { name, age: parseInt(age), gender, occupation, currentStep },
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Basic info update failed" });
  }
};

/**
 * 2️⃣ BUDGET & LOCALITIES (Now columns, not dynamic)
 */
export const updateBudgetLocation = async (req, res) => {
  try {
    const {
      budgetMin,
      budgetMax,
      preferredLocationIds,
      moveInDate,
      currentStep,
    } = req.body;
    const userId = req.user.userId;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        budgetMin,
        budgetMax,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        currentStep,
        // Connect locations by their IDs
        preferredLocations: {
          set: preferredLocationIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        preferredLocations: true,
      },
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Budget & location update failed" });
  }
};
/**
 * 3️⃣ LIFESTYLE (Dynamic questions)
 */
export const updateLifestyle = async (req, res) => {
  try {
    const { responses, currentStep } = req.body;
    const userId = req.user.userId;

    const profile = await getOrCreateProfile(userId);

    // Update responses for lifestyle questions
    const updatePromises = responses.map((response) => {
      return prisma.questionResponse.upsert({
        where: {
          profileId_questionId: {
            profileId: profile.id,
            questionId: response.questionId,
          },
        },
        update: {
          textValue: response.textValue,
          numberValue: response.numberValue,
          dateValue: response.dateValue,
          selectedOptions: response.selectedOptions,
        },
        create: {
          profileId: profile.id,
          questionId: response.questionId,
          textValue: response.textValue,
          numberValue: response.numberValue,
          dateValue: response.dateValue,
          selectedOptions: response.selectedOptions,
        },
      });
    });

    await Promise.all(updatePromises);

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { currentStep },
      include: {
        questionResponses: true,
      },
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Lifestyle update failed" });
  }
};

/**
 * 4️⃣ GET QUESTIONS BY CATEGORY
 */
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const userId = req.user.userId;

    // Get profile
    const profile = await getOrCreateProfile(userId);

    // Get questions for category with options
    const questions = await prisma.question.findMany({
      where: {
        category: {
          name: categoryName,
        },
        isActive: true,
      },
      include: {
        options: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    // Get existing responses for these questions
    const responses = await prisma.questionResponse.findMany({
      where: {
        profileId: profile.id,
        questionId: {
          in: questions.map((q) => q.id),
        },
      },
    });

    // Map responses to questions
    const questionsWithResponses = questions.map((question) => {
      const response = responses.find((r) => r.questionId === question.id);
      return {
        ...question,
        response: response
          ? {
            textValue: response.textValue,
            numberValue: response.numberValue,
            dateValue: response.dateValue,
            selectedOptions: response.selectedOptions,
          }
          : null,
      };
    });

    res.json({ success: true, questions: questionsWithResponses });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch questions" });
  }
};

/**
 * 5️⃣ GET ALL QUESTIONS WITH CATEGORIES
 */
export const getAllQuestions = async (req, res) => {
  try {
    const categories = await prisma.questionCategory.findMany({
      include: {
        questions: {
          where: { isActive: true },
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch questions" });
  }
};

/**
 * 6️⃣ GET USER'S RESPONSES
 */
export const getUserResponses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        questionResponses: {
          include: {
            question: {
              include: {
                category: true,
                options: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, responses: profile?.questionResponses || [] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch responses" });
  }
};

// 7️⃣ PHOTOS (ADD)
export const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentStep } = req.body;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const filePath = req.file.location;

    const profile = await prisma.profile.update({
      where: { userId },
      data: { currentStep: parseInt(currentStep) },
    });

    if (!profile) {
      fs.unlinkSync(filePath);
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const photo = await prisma.photo.create({
      data: {
        profileId: profile.id,
        url: filePath,
      },
    });

    res.json({
      success: true,
      message: "Photo uploaded successfully",
      photoPath: filePath,
      photoId: photo.id,
    });
  } catch (err) {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error uploading photo:", err);
    res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: err.message,
    });
  }
};

// 8️⃣ PHOTOS (DELETE)
export const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    await prisma.photo.delete({
      where: { id: photoId },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete photo failed" });
  }
};

/**
 * 9️⃣ BIO (Unchanged)
 */
export const updateBio = async (req, res) => {
  try {
    const { bio, currentStep } = req.body;
    const userId = req.user.userId;

    const profile = await prisma.profile.update({
      where: { userId },
      data: { bio, currentStep },
    });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Bio update failed" });
  }
};

/**
 * 🔟 GET FULL PROFILE
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            photos: true,
            preferredLocations: true, // Added location relationship
            questionResponses: {
              include: {
                question: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Fetch profile failed" });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        message: "userId not found!!",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            isVerified: true,
          },
        },
        photos: true,
        preferredLocations: true, // Added location relationship
        questionResponses: {
          include: {
            question: {
              include: {
                category: true,
                options: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Fetch profile failed" });
  }
};
export const deleteRequest = async (req, res) => {
  try {
    res.json({ success: true, message: "Account deletion request sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete profile failed" });
  }
};

export const reportUser = async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    const reporterId = req.user.userId;

    if (!targetUserId || !reason) {
      return res.status(400).json({ success: false, message: "Target userId and reason are required" });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetUserId,
        reason,
      },
    });

    res.json({ success: true, message: "Report submitted successfully", report });
  } catch (err) {
    console.error("Report user error:", err);
    res.status(500).json({ success: false, message: "Report failed" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const blockerId = req.user.userId;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "Target userId is required" });
    }

    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId: targetUserId,
      },
    });

    res.json({ success: true, message: "User blocked successfully", block });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ success: false, message: "Block failed" });
  }
};


