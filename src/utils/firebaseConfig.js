import admin from "firebase-admin";
import serviceAccount from "../../staymate-111db-firebase-adminsdk-fbsvc-5b1652d880" with { type: "json" };
if (!admin.apps.length)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
export default admin;
