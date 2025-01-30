import React, { useEffect, useState } from "react";
import { auth, db, provider } from "./firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Login from "./components/Login";
import Journey from "./components/Journey";

const App = () => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

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

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            journeyItems: [],
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed:", error);
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      }
    }
  };

  return (
    <div className="app">
      {user || isGuest ? (
        <>
          <Journey user={user} />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Login
          setUser={setUser}
          handleGuestLogin={handleGuestLogin}
          handleGoogleLogin={handleGoogleLogin}
        />
      )}
    </div>
  );
};

export default App;
