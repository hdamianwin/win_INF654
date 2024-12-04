import { addStudyToFirebase, getStudyFromFirebase, deleteStudyFromFirebase, updateStudyInFirebase } from "./firebaseDB.js";
import { openDB } from "https://unpkg.com/idb?module";

// --- Constants ---
const STORAGE_THRESHOLD = 0.8; // Set a threshold to monitor storage capacity

// --- Event Listener for DOM Content Loaded ---
document.addEventListener("DOMContentLoaded", async function () {
  // Initialize Sidenav components
  const menus = document.querySelector(".sidenav");
  M.Sidenav.init(menus, { edge: "right" });
  const forms = document.querySelector(".side-form");
  M.Sidenav.init(forms, { edge: "left" });

  // Load studies from Firebase or IndexedDB
  loadStudies();

  // Check current storage usage
  checkStorageUsage();

    // Periodic sync every 10 minutes
    setInterval(syncStudies, 10 * 60 * 1000);

    // Periodic cleanup every 24 hours
    setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

  // Sync studies to Firebase if necessary
  syncStudies();

  // Request for persistent storage
  requestPersistentStorage();

  // Handle form submission for new study session
  document.getElementById('study-form').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    // Get user input for subject and study time
    const subject = document.getElementById('subject').value;
    const studyTime = parseFloat(document.getElementById('study-time').value);
  
    // Validate study time
    if (isNaN(studyTime) || studyTime <= 0) {
      alert("Please enter a valid positive number for study time.");
      return;
    }
  
    // Calculate cycles
    const studyPerCycle = 15; // 15 minutes study per cycle
    const breakPerCycle = 5;  // 5 minutes break per cycle
    const totalCycleTime = studyPerCycle + breakPerCycle;
    const cycles = Math.floor(studyTime / totalCycleTime);
    const remainingTime = studyTime % totalCycleTime;
  
    // Create microlearning description
    let description = `${cycles} cycle(s): ${studyPerCycle} minutes study + ${breakPerCycle} minutes break per cycle.`;
    if (remainingTime > 0) {
      const remainingStudy = Math.min(remainingTime, studyPerCycle);
      const remainingBreak = Math.max(0, remainingTime - studyPerCycle);
      description += ` Remaining time: ${remainingStudy} minutes study + ${remainingBreak} minutes break.`;
    }
  
    // Create study object
    const study = { subject, studyTime, description };
  
    // Add study to IndexedDB and Firebase
    const addedStudy = await addStudy(study);
  
    // Display study in the UI
    displayStudy(addedStudy);
  });  
});

// --- Register Service Worker ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceworker.js")
    .then((req) => console.log("Service Worker Registered!", req))
    .catch((err) => console.log("Service Worker registration failed!", err));
}

// Create or Get IndexedDB database instance
let dbPromise;
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("microlearning", 1, {
      upgrade(db) {
        const store = db.createObjectStore("studies", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status");
        store.createIndex("synced", "synced");
      },
    });
  }
  return dbPromise;
}


// --- Sync Studies from IndexedDB to Firebase ---
export async function syncStudies() {
  try {
    const db = await getDB();
    
    // Transaction to read all studies from IndexedDB
    const tx = db.transaction("studies", "readonly");
    const store = tx.objectStore("studies");

    // Wait for the transaction to complete
    const studies = await store.getAll(); // Get all studies from IndexedDB

    // Sync local studies to Firebase if they are not synced and the app is online
    for (const study of studies) {
      if (!study.synced && isOnline()) {
        try {
          // Prepare study data to sync
          const studyToSync = {
            subject: study.subject || "Untitled",
            description: study.description || "No description",
            status: study.status || "not started",
            studyTime: study.studyTime || 0
          };

          // Sync the study to Firebase
          const savedStudy = await addStudyToFirebase(studyToSync);

          if (savedStudy && savedStudy.id) {
            // Update the study in IndexedDB with the Firebase ID and mark it as synced
            const txUpdate = db.transaction("studies", "readwrite");
            const storeUpdate = txUpdate.objectStore("studies");
            await storeUpdate.put({ ...study, id: savedStudy.id, synced: true });

            // Wait for the update transaction to complete before moving to the next study
            await txUpdate.done;
          }
        } catch (error) {
          console.error("Error syncing study:", error);
        }
      }
    }

    // Handle deletions by checking Firebase data against IndexedDB
    const firebaseStudies = await getStudyFromFirebase(); // Fetch all studies from Firebase
    const firebaseStudyIds = firebaseStudies.map(study => study.id); // Extract Firebase study IDs

    // Transaction to delete studies from IndexedDB that don't exist in Firebase
    const deleteTx = db.transaction("studies", "readwrite");
    const deleteStore = deleteTx.objectStore("studies");

    // Loop through all local studies and check if they need to be deleted (not found in Firebase)
    for (const study of studies) {
      if (!firebaseStudyIds.includes(study.id)) {
        // If the study ID doesn't exist in Firebase, delete it from IndexedDB
        await deleteStore.delete(study.id);
        console.log(`Deleted local study: ${study.subject} from IndexedDB.`);
      }
    }

    // Wait for the deletion transaction to complete
    await deleteTx.done;

  } catch (error) {
    console.error("Error syncing studies:", error);
  }
}




async function cleanupOldData() {
  const db = await getDB();
  const tx = db.transaction("studies", "readwrite");
  const store = tx.objectStore("studies");
  const studies = await store.getAll();

  const currentTime = Date.now();
  const timeThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  for (const study of studies) {
      if (currentTime - new Date(study.createdAt).getTime() > timeThreshold) {
          try {
              await store.delete(study.id);
              console.log(`Deleted old study: ${study.subject}`);
          } catch (error) {
              console.error("Error deleting old study:", error);
          }
      }
  }
  await tx.done;
}


// Check if the app is online
function isOnline() {
  return navigator.onLine;
}

// --- Add Study ---
async function addStudy(study) {
  const db = await getDB();
  let studyId;

  if (isOnline()) {
    try {
      const savedStudy = await addStudyToFirebase(study);
      studyId = savedStudy.id;
      const tx = db.transaction("studies", "readwrite");
      const store = tx.objectStore("studies");
      await store.put({ ...study, id: studyId, synced: true });
      await tx.done;
    } catch (error) {
      console.error("Error adding study to Firebase:", error);
    }
  } else {
    studyId = `temp-${Date.now()}`;
    const studyToStore = { ...study, id: studyId, synced: false };
    const tx = db.transaction("studies", "readwrite");
    const store = tx.objectStore("studies");
    await store.put(studyToStore);
    await tx.done;
  }

  checkStorageUsage();
  return { ...study, id: studyId };
}

// Delete Study with Transaction
async function deleteStudy(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteStudy.");
    return;
  }

  // Remove study from the UI
  const studyCard = document.querySelector(`[data-id="${id}"]`);
  if (studyCard) {
    studyCard.remove();
  }

  const db = await getDB();

  if (isOnline()) {
    try {
      // Delete study from Firebase
      await deleteStudyFromFirebase(id);

      // Also remove it from IndexedDB after successful deletion from Firebase
      const tx = db.transaction("studies", "readwrite");
      const store = tx.objectStore("studies");
      await store.delete(id); // Remove study from IndexedDB
      await tx.done;
    } catch (error) {
      console.error("Error deleting study from Firebase", error);
    }
  } else {
    // If offline, just remove it from IndexedDB
    const tx = db.transaction("studies", "readwrite");
    const store = tx.objectStore("studies");
    await store.delete(id); // Delete study from IndexedDB
    await tx.done;
  }

  // Recheck storage usage after deletion
  checkStorageUsage();
}


// When you call the function to delete a study
async function handleDelete(studyId) {
  try {
    await deleteStudyFromFirebase(studyId);
    console.log(`Study with ID: ${studyId} deleted from Firebase.`);
  } catch (error) {
    console.error("Error deleting study:", error);
  }
}

// --- UI Functions ---
// Load studies and sync with Firebase if online
export async function loadStudies() {
  const db = await getDB();
  const studyContainer = document.querySelector(".studies");
  studyContainer.innerHTML = "";

  if(isOnline()){
    const firebaseStudies = await getStudyFromFirebase();
    const tx = db.transaction("studies", "readwrite");
    const store = tx.objectStore("studies");

    for (const study of firebaseStudies) {
      await store.put({ ...study, synced: true});
      displayStudy(study);
    }
    await tx.done;
  } else {
    const tx = db.transaction("studies", "readonly");
    const store = tx.objectStore("studies");
    const studies = await store.getAll();
    studies.forEach((study) => {
      displayStudy(study);
    });
    await tx.done;
  }
}

// --- Display Study ---
function displayStudy(study) {
  console.log('Displaying study:', study);  // Debugging log
  
  const studyContainer = document.querySelector(".studies");

  // Avoid duplicate rendering
  const existingStudy = studyContainer.querySelector(`[data-id="${study.id}"]`);
  if (existingStudy) {
    existingStudy.remove();
  }

  const studyElement = document.createElement("div");
  studyElement.classList.add("card", "white", "row", "valign-wrapper");
  studyElement.setAttribute("data-id", study.id);
  studyElement.innerHTML = `
      <div class="col s2 center-align">
          <img src="/images/icons/book.png" class="circle responsive-img" alt="Study Icon" style="max-width: 80px; height: auto;" />
      </div>
      <div class="col s8">
          <h5 class="study-title black-text" style="font-weight: bold; margin: 0;">${study.subject || 'Untitled'}</h5>
          <p class="study-description grey-text text-darken-1" style="margin: 5px 0;">${study.description}</p>
      </div>
      <div class="col s2 right-align">
          <button class="study-delete btn-flat" aria-label="Delete study" style="margin-right: 5px;">
              <i class="material-icons red-text" style="font-size: 24px;">delete</i>
          </button>
      </div>
  `;

  studyContainer.appendChild(studyElement);
}


// Event delegation for delete buttons
document.querySelector(".studies").addEventListener("click", (event) => {
  if (event.target.closest(".study-delete")) {
      const studyElement = event.target.closest(".card");
      const studyId = studyElement.getAttribute("data-id");
      deleteStudy(studyId);
  }
});




// Function to check storage usage
async function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    const usageInMB = (usage / (1024 * 1024)).toFixed(2); // Convert to MB
    const quotaInMB = (quota / (1024 * 1024)).toFixed(2); // Convert to MB

    console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

    // Update the UI with storage info
    const storageInfo = document.querySelector("#storage-info");
    if (storageInfo) {
      storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
    }

    // Warn the user if storage usage exceeds 80%
    if (usage / quota > 0.8) {
      const storageWarning = document.querySelector("#storage-warning");
      if (storageWarning) {
        storageWarning.textContent =
          "Warning: You are running low on storage space. Please delete old tasks to free up space.";
        storageWarning.style.display = "block";
      }
    } else {
      const storageWarning = document.querySelector("#storage-warning");
      if (storageWarning) {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    }
  }
}

// Function to request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();
    console.log(`Persistent storage granted: ${isPersistent}`);

    // Update the UI with a message
    const storageMessage = document.querySelector("#persistent-storage-info");
    if (storageMessage) {
      if (isPersistent) {
        storageMessage.textContent =
          "Persistent storage granted. Your data is safe!";
        storageMessage.classList.remove("red-text");
        storageMessage.classList.add("green-text");
      } else {
        storageMessage.textContent =
          "Persistent storage not granted. Data might be cleared under storage pressure.";
        storageMessage.classList.remove("green-text");
        storageMessage.classList.add("red-text");
      }
    }
  }
}