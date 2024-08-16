import React, { useRef } from "react";
import "./homePage.css";

const HomePage = ({ setRoom }) => {
  const roomInputRef = useRef(null);

  const enterChatRoom = () => {
    setRoom(roomInputRef.current.value);
  };

  return (
    <div className="room">
      <label className="room-label">Enter Room Name:</label>
      <input className="room-name-input" ref={roomInputRef} />
      <button className="enter-chat"  onClick={enterChatRoom}>Enter Chat</button>
    </div>
  );
};

export default HomePage;
