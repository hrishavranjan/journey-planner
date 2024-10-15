import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // Import your Firebase config
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; 
import { setDoc, doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { FaGoogle } from 'react-icons/fa'; // Importing Google logo
import './Login.css';

const Login = ({ setUser, handleGuestLogin, db }) => {
  const provider = new GoogleAuthProvider();

  // State for email and password input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error messages
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and registration

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid); // Use user's UID as document ID
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // If user does not exist, create a new document without prompting for name
        await setDoc(userRef, {
          username: user.displayName || email.split("@")[0], // Use display name or part of email as username
          journey: [] // Initialize journey as an empty array
        });
      }

      const userData = userDoc.exists() ? userDoc.data() : { username: user.displayName || email.split("@")[0] };
      setUser({ username: userData.username }); // Successful login
      setError(""); // Clear any previous error messages
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to log in with Google. Please try again."); // Handle Google login errors
    }
  };

  // Handle user login or registration
  const handleLoginOrRegister = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const trimmedEmail = email.trim(); // Trim whitespace from email
      const trimmedPassword = password.trim(); // Trim whitespace from password

      if (isRegistering) {
        // Create a new user account
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;

        // Create a user document in Firestore without prompting for name
        await setDoc(doc(db, "users", user.uid), {
          username: trimmedEmail.split("@")[0], // Use part of email as username
          journey: [] // Initialize journey as an empty array
        });

        setUser({ username: trimmedEmail.split("@")[0] }); // Set user state to logged in
        setError(""); // Clear error message
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;

        // Fetch user from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ username: userData.username }); // Set user state to logged in
          setError(""); // Clear error message
        } else {
          setError("User not found."); // Show error if user does not exist
        }
      }
    } catch (error) {
      console.error("Error logging in/creating user:", error);
      if (isRegistering) {
        if (error.code === 'auth/email-already-in-use') {
          setError("This email is already in use. Please log in instead.");
        } else {
          setError("Failed to create account. Please try again.");
        }
      } else {
        if (error.code === 'auth/user-not-found') {
          setError("No user found with this email. Please register."); 
        } else if (error.code === 'auth/wrong-password') {
          setError("Incorrect password. Please try again.");
        } else {
          setError("Failed to login. Please try again."); // Show generic error
        }
      }
    }
  };

  return (
    <div className="login">
      <div className="left-panel">
        <h1>Journey Planner :)</h1>
        <div class="special-paragraph">Plan your trips efficiently and keep track of your journeys with ease.</div>
    
      </div>
      <div className="sign-in-box">
        <h2>{isRegistering ? "Create Account" : "Sign In"}</h2>
        <form onSubmit={handleLoginOrRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="custom-button">
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
        
        <button className="google-sign-in" onClick={signInWithGoogle}>
          <FaGoogle className="google-icon" />
          Continue with Google
        </button>
        
        <button className="guest-sign-in" onClick={handleGuestLogin}>
          Continue as Guest
        </button> {/* Updated guest button */}

        <p>
          {isRegistering ? "Already have an account?" : "Don't have an account?"} 
          <span onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: "pointer", color: "blue" }}>
            {isRegistering ? " Login" : " Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
