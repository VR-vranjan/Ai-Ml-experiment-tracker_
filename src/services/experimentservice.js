import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Fetch experiments for a specific user
export const getUserExperiments = async (userId) => {
  try {
    const q = query(
      collection(db, "experiments"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const experiments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return experiments;
  } catch (err) {
    console.error("Error fetching experiments:", err);
    throw err;
  }
};

// Add a new experiment with automatic field sanitization
export const addExperiment = async (experimentData) => {
  try {
    // Remove undefined fields and set defaults
    const sanitizedData = {
      name: experimentData.name || "",
      description: experimentData.description || "",
      status: experimentData.status || "In Progress",
      createdBy: experimentData.createdBy || "unknown",
      experimentId: experimentData.experimentId || "",
      metrics: experimentData.metrics || {},
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "experiments"), sanitizedData);
    return docRef.id;
  } catch (err) {
    console.error("Error adding experiment:", err);
    throw err;
  }
};
