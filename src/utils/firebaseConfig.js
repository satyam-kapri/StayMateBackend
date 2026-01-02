import admin from "firebase-admin";
import serviceAccount from "../../staymate-70849-firebase-adminsdk-fbsvc-c92256cd7d.json" with { type: "json" };
if (!admin.apps.length) 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export default admin;