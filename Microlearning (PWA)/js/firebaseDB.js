// Import the functions you need from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration object containing API keys and project details
const firebaseConfig = {
  apiKey: "AIzaSyBeLs8C71yppR-edSE2tJuhNEU5M4rEtkU",
  authDomain: "microlearning-8f128.firebaseapp.com",
  projectId: "microlearning-8f128",
  storageBucket: "microlearning-8f128.firebasestorage.app",
  messagingSenderId: "879235145309",
  appId: "1:879235145309:web:076919bd69917326d3b7b4",
  measurementId: "G-EYXKJXHH35"
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);

// Access the Firestore database from the Firebase app
const db = getFirestore(app);

// Function to add a new study session to Firebase Firestore
export async function addStudyToFirebase(study) {
  try {
    const studyToAdd = {
      ...study,
      status: study.status || "not started", // Default status if not provided
    };

    const docRef = await addDoc(collection(db, "studies"), studyToAdd);
    return { id: docRef.id, ...studyToAdd }; // This ensures that the subject and other fields are included
  } catch (error) {
    console.error("Error adding study: ", error);
  }
}

// Function to retrieve all study sessions from Firebase Firestore
export async function getStudyFromFirebase() {
  const studies = [];
  try {
    const querySnapshot = await getDocs(collection(db, "studies"));
    querySnapshot.forEach((doc) => {
      studies.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Error retrieving tasks: ", error);
  }
  return studies;
}


// Function to delete a study from Firebase Firestore
export async function deleteStudyFromFirebase(id) {
  try {
    await deleteDoc(doc(db, "studies", id));
    console.log(`Study with ID: ${id} has been deleted.`);
  } catch (e) {
    console.error("Error deleting study: ", e);
  }
}


// Function to update a study in Firebase
export async function updateStudyInFirebase(id, updatedStudy) {
  console.log(updatedStudy, id); // Create reference to the study document
  try {
    const studyRef = doc(db, "studies", id);
    console.log(studyRef);
    await updateDoc(studyRef, updatedStudy);

    // After updating Firebase, also update the study in IndexedDB
    const db = await getDB(); // Get IndexedDB
    const tx = db.transaction("studies", "readwrite");
    const store = tx.objectStore("studies");
    await store.put({ ...updatedStudy, id, synced: true }); // Mark as synced in IndexedDB
    await tx.done; // Commit the transaction

  } catch (error) {
    console.error('Error updating study: ', error);
  }
}
