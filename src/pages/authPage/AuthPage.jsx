import React, { useState } from "react";
import { auth, googleProvider, db } from "../../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Cookies from "universal-cookie";
import GoogleLogo from "../../images/googlelogo.png";
import "./authPage.css";

const cookies = new Cookies();

const AuthPage = (props) => {
    const { setIsAuth } = props;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // For confirming the password
    const [name, setName] = useState(""); // For collecting user name
    const [isRegistering, setIsRegistering] = useState(false); // Show sign-in mode first
    const [error, setError] = useState(""); // For storing error messages

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/user-disabled':
                return 'User account has been disabled.';
            case 'auth/user-not-found':
                return 'No user found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'Email is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-credential':
                return 'Invalid credentials provided.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const handleAuth = async () => {
        if (!email || !password || (isRegistering && (!name || !confirmPassword))) {
            setError("Please fill in all fields.");
            return;
        }

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            try {
                // Register
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update the user's profile with their name
                if (user) {
                    await updateProfile(user, { displayName: name });

                    // Create a document in the users collection
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { name });

                    cookies.set("auth-token", user.refreshToken);
                    setIsAuth(true);
                }
            } catch (error) {
                console.error("Error during authentication:", error.message);
                setError(getErrorMessage(error.code)); // Set the user-friendly error message
            }
        } else {
            try {
                // Sign in
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                cookies.set("auth-token", user.refreshToken);
                setIsAuth(true);
            } catch (error) {
                console.error("Error during authentication:", error.message);
                setError(getErrorMessage(error.code)); // Set the user-friendly error message
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            cookies.set("auth-token", user.refreshToken);

            // Create a document in the users collection for Google sign-in
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { name: user.displayName || 'Anonymous' });

            setIsAuth(true);
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            setError(getErrorMessage(error.code)); // Set the user-friendly error message
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAuth();
        }
    };

    return (
        <div className="register-container">
            <h1>{isRegistering ? "Join Us" : "Sign In"}</h1>
            {isRegistering && (
                <input
                    type="text"
                    placeholder="Name"
                    className="input-field"
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            )}
            <input
                type="email"
                placeholder="Email"
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <input
                type="password"
                placeholder="Password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            {isRegistering && (
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="input-field"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            )}
            {error && <p className="error-message">{error}</p>} {/* Display error message */}
            <button className="sign-in-button" onClick={handleAuth}>
                {isRegistering ? "Sign Up" : "Sign In"}
            </button>
            <p className="or-text">or</p>
            <button className="google-sign-in-button" onClick={signInWithGoogle}>
                <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                Sign in with Google
            </button>
            <p className="toggle-auth">
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <button className="link-transfer-mode" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;
