import React, { useRef } from "react";
import "./homePage.css";

const HomePage = ({ setRoom }) => {
  const roomInputRef = useRef(null);

  const enterChatRoom = () => {
    if (roomInputRef.current) {
      setRoom(roomInputRef.current.value);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      enterChatRoom();
    }
  };

  return (
    <div className="room">
      <label className="room-label">Enter Room Name:</label>
      <input
        className="room-name-input"
        ref={roomInputRef}
        onKeyPress={handleKeyPress}
      />
      <button className="enter-chat" onClick={enterChatRoom}>Enter Chat</button>
    </div>
  );
};

export default HomePage;
