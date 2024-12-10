import { auth } from "./firebaseConfig.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { firebaseConfig } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("sign-in-form");
  const signUpForm = document.getElementById("sign-up-form");
  const showSignUp = document.getElementById("show-signup");
  const showSignIn = document.getElementById("show-signin");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");
  console.log(signInBtn);

  showSignIn.addEventListener("click", () => {
    signUpForm.style.display = "none";
    signInForm.style.display = "block";
  });

  showSignUp.addEventListener("click", () => {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
  });

  signUpBtn.addEventListener("click", async () => {
    const email = document.getElementById("sign-up-email").value;
    const password = document.getElementById("sign-up-password").value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      M.toast({ html: "Sign up successful!" });
      window.location.href = "/";
      signUpForm.style.display = "none";
      signInForm.style.display = "block";
    } catch (e) {
      M.toast({ html: e.message });
    }
  });

  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("sign-in-email").value;
    const password = document.getElementById("sign-in-password").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      M.toast({ html: "Sign-in successful!" });
      window.location.href = "/"; // Redirect to home page after successful sign-in
    } catch (e) {
      console.error("Sign-in error: ", e);
      M.toast({ html: e.message });
    }
  });
});