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
      preferredAreas: [],
    },
  });
};

/**
 * 1️⃣ BASIC INFO
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
 * 2️⃣ BUDGET & LOCALITIES
 */
export const updateBudgetLocation = async (req, res) => {
  try {
    const { budgetMin, budgetMax, preferredAreas, moveInDate, currentStep } =
      req.body;
    const userId = req.user.userId;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        budgetMin,
        budgetMax,
        preferredAreas,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        currentStep,
      },
    });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Budget update failed" });
  }
};

/**
 * 3️⃣ LIFESTYLE (CHIPS)
 */
export const updateLifestyle = async (req, res) => {
  try {
    const {
      sleepHabit,
      cleanliness,
      smoking,
      drinking,
      pets,
      socialVibe,
      currentStep,
    } = req.body;

    const userId = req.user.userId;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        sleepHabit,
        cleanliness,
        smoking,
        drinking,
        pets,
        socialVibe,
        currentStep,
      },
    });

    res.json({ success: true, profile });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lifestyle update failed" });
  }
};

/**
 * 4️⃣ PHOTOS (ADD)
 * expects uploadedUrls[] from cloud upload middleware
 */
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
      // If profile not found, delete the uploaded file
      fs.unlinkSync(filePath); // Delete the uploaded file
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const photo = await prisma.photo.create({
      data: {
        profileId: profile.id,
        url: filePath, // Store the path of the uploaded file
      },
    });

    res.json({
      success: true,
      message: "Photo uploaded successfully",
      photoPath: filePath,
      photoId: photo.id,
    });
  } catch (err) {
    // If an error occurs, delete the uploaded file if it exists
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error uploading photo:", err); // Log the actual error
    res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: err.message,
    });
  }
};

/**
 * 4️⃣ PHOTOS (DELETE)
 */
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
 * 5️⃣ BIO
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
 * 6️⃣ GET FULL PROFILE
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        isVerified: true,
        premiumStatus: true,
        profile: {
          select: {
            name: true,
            age: true,
            occupation: true,
            gender: true,
            photos: true,
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
