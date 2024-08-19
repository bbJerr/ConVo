import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { signOut } from 'firebase/auth';
import { auth } from "./config/firebase";
import Auth from "./pages/authPage/AuthPage";
import HomePage from "./pages/homePage/HomePage";
import Chat from "./pages/chatPage/ChatPage";
import Cookies from "universal-cookie";
import "./App.css";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuth ? <HomePage setRoom={setRoom} /> : <Auth setIsAuth={setIsAuth} />} />
        <Route path="/chat" element={isAuth && room ? <Chat room={room} /> : (isAuth ? <HomePage setRoom={setRoom} /> : <Auth setIsAuth={setIsAuth} />)} />
      </Routes>
      {isAuth && (
        <div className="sign-out">
          <button onClick={signUserOut}>Logout</button>
        </div>
      )}
    </Router>
  );
}

export default App;
