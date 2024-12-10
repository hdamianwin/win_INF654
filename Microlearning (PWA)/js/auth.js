import { auth } from "./firebaseConfig.js";

import {
    signOut,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { loadStudies, syncStudies } from "./ui.js";

export let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  console.log(logoutBtn);
  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      currentUser = user;
      console.log("User ID: ", user.uid);
      console.log("Email: ", user.email);
      logoutBtn.style.display = "block";
      loadStudies();
      syncStudies();
    } else {
      // No user is signed in.
      console.log("No user is currently signed in.");
      // If the user is not signed in, redirect to the auth page
      window.location.href = "/pages/auth.html";
    }
  });
  // Handle logout functionality
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      M.toast({ html: "Logout successful!" });
      logoutBtn.style.display = "none";
      window.location.href = "/pages/auth.html";
    } catch (error) {
      M.toast({ html: error.message });
    }
  });
});