import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { signOut } from 'firebase/auth';
import { auth } from "./config/firebase";
import { FaSignOutAlt } from "react-icons/fa";
import Auth from "./pages/authPage/AuthPage";
import Home from "./pages/homePage/HomePage";
import Chat from "./pages/chatPage/ChatPage";
import Profile from "./pages/profilePage/ProfilePage";
import Cookies from "universal-cookie";
import "./App.css";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(localStorage.getItem("currentRoom") || null);

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
    localStorage.removeItem("currentRoom");
  };

  useEffect(() => {
    localStorage.setItem("currentRoom", room);
  }, [room]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuth ? <Home setRoom={setRoom} /> : <Auth setIsAuth={setIsAuth} />} />
        <Route path="/chat" element={isAuth && room ? <Chat room={room} /> : (isAuth ? <Home setRoom={setRoom} /> : <Auth setIsAuth={setIsAuth} />)} />
        <Route path="/profile/:name" element={isAuth ? <Profile /> : <Auth setIsAuth={setIsAuth} />} />
      </Routes>
      {isAuth && <LogoutButton signUserOut={signUserOut} />}
    </Router>
  );
}

function LogoutButton({ signUserOut }) {
  const location = useLocation();
  const showLogoutButton = 
    location.pathname === '/' || 
    location.pathname === '/profile' || 
    location.pathname.startsWith('/profile/');

  return showLogoutButton ? (
    <div className="sign-out">
      <button onClick={signUserOut} className="logout-button">
        <FaSignOutAlt />
      </button>
    </div>
  ) : null;
}

export default App;
