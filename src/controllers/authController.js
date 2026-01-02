import prisma from "../../prisma/client.js";
import jwt from "jsonwebtoken";
import admin from "../utils/firebaseConfig.js";

export const verifyToken = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;
    const uid = decodedToken.uid;

    //upsert user in the database
    let createdUser = await prisma.user.upsert({
      where: { phone: phoneNumber },
      update: {},
      create: { firebaseUid: uid, phone: phoneNumber },
    });

    const user = await prisma.user.findFirst({
      where: { id: createdUser.id },
      select: {
        id: true,
        phone: true,
        isVerified: true,
        firebaseUid: true,
        premiumStatus: true,
        profile: {
          select: {
            name: true,
            gender: true,
            age: true,
            occupation: true,
            photos: true,
            currentStep: true,
          },
        },
      },
    });
    // Create your own session token
    const sessionToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const currentStep = user.profile ? user.profile.currentStep : 0;
    // Here, you can create a session, look up the user in your DB, etc.
    res.status(200).send({
      status: "Success",
      user,
      sessionToken,
      newUser: !user.profile,
      currentStep,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).send("Unauthorized");
  }
};

export const fakeAuth = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    //upsert user in the database
    let createdUser = await prisma.user.upsert({
      where: { phone: phoneNumber },
      update: {},
      create: { firebaseUid: "hghghjghgdhjd", phone: phoneNumber },
    });

    const user = await prisma.user.findFirst({
      where: { id: createdUser.id },
      select: {
        id: true,
        phone: true,
        isVerified: true,
        firebaseUid: true,
        premiumStatus: true,
        profile: {
          select: {
            name: true,
            gender: true,
            age: true,
            occupation: true,
            photos: true,
            currentStep: true,
          },
        },
      },
    });
    // Create your own session token
    const sessionToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const currentStep = user.profile ? user.profile.currentStep : 0;
    // Here, you can create a session, look up the user in your DB, etc.
    res.status(200).send({
      status: "Success",
      user,
      sessionToken,
      newUser: !user.profile,
      currentStep,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).send("Unauthorized");
  }
};
