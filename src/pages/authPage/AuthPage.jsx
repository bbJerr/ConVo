import React, { useState } from "react";
import { auth, googleProvider } from "../../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup} from 'firebase/auth';
import Cookies from "universal-cookie";
import GoogleLogo from "../../images/googlelogo.png";
import "./authPage.css";

const cookies = new Cookies();

const AuthPage = (props) => {
    const {setIsAuth} = props;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    console.log(auth?.currentUser?.email);

    const signIn = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
    }

    const signInWithGoogle = async () => {
        try {
        const result = await signInWithPopup(auth, googleProvider);
        cookies.set("auth-token", result.user.refreshToken);
        setIsAuth(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="register-container">
            <h1>Join Us</h1>
            <input
                type="email"
                placeholder="Email"
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="sign-in-button" onClick={signIn}>
                Sign In
            </button>
            <p className="or-text">or</p>
            <button className="google-sign-in-button" onClick={signInWithGoogle}>
                <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                Sign in with Google
            </button>
        </div>
    );
};

export default AuthPage;
