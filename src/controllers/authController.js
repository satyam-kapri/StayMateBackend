import prisma from "../../prisma/client.js";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import serviceAccount from "../../staymate-70849-firebase-adminsdk-fbsvc-c92256cd7d.json" with { type: "json" };
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const verifyToken = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;
    const uid = decodedToken.uid;
    console.log("Decoded Token:", decodedToken);
    console.log("Phone Number:", phoneNumber);
    console.log("UID:", uid);
    //upsert user in the database
    const user = await prisma.user.upsert({
      where: { phone: phoneNumber },
      update: {},
      create: { firebaseUid: uid, phone: phoneNumber },
    });
    console.log("User:", user);
    // Create your own session token
    const sessionToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Here, you can create a session, look up the user in your DB, etc.
    res.status(200).send({ status: "Success", user, sessionToken });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).send("Unauthorized");
  }
};
