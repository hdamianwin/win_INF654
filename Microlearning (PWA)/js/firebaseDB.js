import { currentUser } from "./auth.js";
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Function to add a new study session to Firebase Firestore
export async function addStudyToFirebase(study) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    
    const userId = currentUser.uid;
    const userRef = doc(db, "users", userId); // Reference the user document

    // Set or merge email and name in the user document
    await setDoc(
      userRef,
      {
        email: currentUser.email,
        name: currentUser.displayName,
      },
      { merge: true }
    );

    // Now, add the study with the email
    const studyToAdd = {
      ...study,
      status: study.status || "not started", // Default status if not provided
    };

    const studiesRef = collection(db, "users", userId, "studies"); // Reference the studies collection
    const docRef = await addDoc(studiesRef, studyToAdd);

    return { id: docRef.id, ...studyToAdd }; // Ensure valid return structure
  } catch (error) {
    console.error("Error adding study:", error);
    return null; // Return null if an error occurs
  }
}



// Function to retrieve all study sessions from Firebase Firestore
export async function getStudyFromFirebase() {
  const studies = [];
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    const userId = currentUser.uid;
    const studiesRef = collection(doc(db, "users", userId), "studies");
    const querySnapshot = await getDocs(studiesRef);
    querySnapshot.forEach((doc) => {
      studies.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Error retrieving studies: ", error);
  }
  return studies;
}

// Function to delete a study from Firebase Firestore
export async function deleteStudyFromFirebase(id) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    const userId = currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "studies", id));
    console.log(`Study with ID: ${id} has been deleted.`);
  } catch (e) {
    console.error("Error deleting study: ", e);
  }
}
