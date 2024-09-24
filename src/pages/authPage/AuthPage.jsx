import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Cookies from "universal-cookie";
import GoogleLogo from "../../images/googleLogo.png";
import "./authPage.css";

const cookies = new Cookies();

const AuthPage = (props) => {
    const { setIsAuth } = props;
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const [loginAttempts, setLoginAttempts] = useState(0); 
    const [isLockedOut, setIsLockedOut] = useState(false); 
    const [lockoutTimer, setLockoutTimer] = useState(0); 

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
            case 'auth/invalid-credential':
                return 'Invalid credentials provided.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    useEffect(() => {
        if (isLockedOut) {
            const timer = setInterval(() => {
                setLockoutTimer(prev => {
                    if (prev === 1) {
                        setIsLockedOut(false);
                        setLoginAttempts(0);
                        clearInterval(timer);
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLockedOut]);

    const handleAuth = async () => {
        if (!isRegistering && isLockedOut) {
            setError(`Too many failed attempts. Please try again in ${lockoutTimer} seconds.`);
            return;
        }

        if (!email || !password || (isRegistering && (!name || !confirmPassword))) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 8 || password.length > 20) {
            setError("Password must be between 8 and 20 characters.");
            return;
        }

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (user) {
                    await updateProfile(user, { displayName: name });

                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { 
                        name,
                        bio: '',
                        profilePic: '',
                     });

                    cookies.set("auth-token", user.refreshToken);
                    setIsAuth(true);
                    navigate("/");
                }
            } catch (error) {
                console.error("Error during authentication:", error.message);
                setError(getErrorMessage(error.code));
            }
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                cookies.set("auth-token", user.refreshToken);
                setIsAuth(true);
            } catch (error) {
                console.error("Error during authentication:", error.message);
                setError(getErrorMessage(error.code));

                setLoginAttempts(prev => prev + 1);

                if (loginAttempts + 1 > 3) {
                    setIsLockedOut(true);
                    setLockoutTimer(300); 
                    setError("Too many failed attempts. You are locked out for 5 minutes.");
                }
            }
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            cookies.set("auth-token", user.refreshToken);

            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { 
                name: user.displayName || 'Anonymous',
                bio: '',
                profilePic: user.photoURL || '',
            }, { merge: true });

            setIsAuth(true);
            navigate("/");
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            setError(getErrorMessage(error.code)); 
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAuth();
        }
    };

    const toggleAuthMode = () => {
        setIsRegistering(!isRegistering);
        setError("");
    };

    const handleInputFocus = () => {
        setError("");
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
                    onFocus={handleInputFocus}
                />
            )}
            <input
                type="email"
                placeholder="Email"
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
            />
            <input
                type="password"
                placeholder="Password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
            />
            {isRegistering && (
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="input-field"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                />
            )}
            {error && <p className="error-message">{error}</p>}
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
                <button className="link-transfer-mode" onClick={toggleAuthMode}>
                    {isRegistering ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;
