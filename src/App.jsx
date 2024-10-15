// import './App.css';
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig"; // Ensure db is imported
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import Login from "./components/Login";
import Journey from "./components/Journey";

const App = () => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const guestStatus = localStorage.getItem("isGuest");
    if (guestStatus) {
      setIsGuest(true);
      setUser({ guest: true });
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
        localStorage.removeItem("isGuest");

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) {
          // If user document doesn't exist, create one
          await setDoc(doc(db, "users", currentUser.uid), {
            name: currentUser.displayName,
            email: currentUser.email,
            journeyItems: [], // Initialize with empty journey items
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isGuest) {
      const confirmLogout = window.confirm(
        "You may lose your updated data. Do you really want to log out as a guest?"
      );
      if (!confirmLogout) return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem("isGuest");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const handleGuestLogin = () => {
    setUser({ guest: true });
    setIsGuest(true);
    localStorage.setItem("isGuest", "true");
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setIsGuest(false);
      localStorage.removeItem("isGuest");
    } catch (error) {
      console.error("Error during Google login: ", error);
    }
  };

  return (
    <div className="app">
      {user || isGuest ? (
        <>
          <Journey user={user} /> {/* Pass user to Journey component */}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Login
          setUser={setUser}
          handleGuestLogin={handleGuestLogin}
          handleGoogleLogin={handleGoogleLogin} // Pass down Google login handler
        />
      )}
    </div>
  );
};

export default App;
