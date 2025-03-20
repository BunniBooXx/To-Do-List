import { database } from "./firebaseConfig.js";
import { ref, set, get } from "firebase/database";


const testFirebaseConnection = async () => {
  try {
    console.log("⏳ Connecting to Firebase...");

    const testRef = ref(database, "test_connection");
    console.log("⏳ Writing test data...");

    await set(testRef, { message: `Hello Firebase! Test at ${new Date().toISOString()}` })
      .then(() => console.log("✅ Data successfully written to Firebase!"))
      .catch((error) => console.error("❌ Write Error:", error));

    console.log("⏳ Reading test data...");
    const snapshot = await get(testRef);

    console.log("✅ Read Attempt Completed!");

    if (snapshot.exists()) {
      console.log("✅ Firebase Test Success:", snapshot.val());
    } else {
      console.error("❌ Data was not written!");
    }
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
  }
};

testFirebaseConnection();

