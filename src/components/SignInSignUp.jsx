// SignInSignUp.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import { useNavigate } from "react-router-dom";

const SignInSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // Handle Email/Password Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email is already in use.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        default:
          setError("Failed to authenticate. Please try again.");
          break;
      }
    }
  };

  // Handle Google Authentication
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError(isSignUp ? "Failed to sign up with Google." : "Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleAuth} className="w-full max-w-sm p-6 bg-white shadow-md rounded-lg">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border rounded-md"
        />
        <button type="submit" className="w-full py-2 bg-red-500 text-white rounded-md mb-2">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <button
          type="button" // Prevent form submission
          onClick={handleGoogleSignIn}
          className="w-full py-2 bg-blue-500 text-white rounded-md"
        >
          {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
        </button>
      </form>
      <p className="text-sm mt-4">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </span>
      </p>
    </div>
  );
};

export default SignInSignUp;
