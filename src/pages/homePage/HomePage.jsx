import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { collection, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import "./homePage.css";

const saveRoomToFirestore = async (userId, roomName) => {
  const userRoomsRef = doc(db, 'userRooms', userId);
  const userRoomsDoc = await getDoc(userRoomsRef);

  if (userRoomsDoc.exists()) {
    const userRoomsData = userRoomsDoc.data();
    if (!userRoomsData.rooms.includes(roomName)) {
      const updatedRooms = [...userRoomsData.rooms, roomName];
      await updateDoc(userRoomsRef, { rooms: updatedRooms });
    }
  } else {
    await setDoc(userRoomsRef, { rooms: [roomName] });
  }
};

const loadUserRooms = async (userId) => {
  const userRoomsRef = doc(db, 'userRooms', userId);
  const userRoomsDoc = await getDoc(userRoomsRef);

  if (userRoomsDoc.exists()) {
    return userRoomsDoc.data().rooms;
  } else {
    return [];
  }
};

const HomePage = ({ setRoom }) => {
  const [userRooms, setUserRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (userId) {
        try {
          const rooms = await loadUserRooms(userId);
          setUserRooms(rooms);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };

    fetchUserRooms();
  }, [userId]);

  const enterChatRoom = () => {
    if (newRoom.trim()) {
      setRoom(newRoom.trim());
      if (userId) {
        saveRoomToFirestore(userId, newRoom.trim()).then(() => {
          setUserRooms((prev) => [...prev, newRoom.trim()]);
        });
      }
      setNewRoom("");
      navigate('/chat');
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
        value={newRoom}
        onChange={(e) => setNewRoom(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type room name"
      />
      <button className="enter-chat" onClick={enterChatRoom}>Enter Chat</button>
      <div className="previous-rooms">
        {userRooms.length > 0 ? (
          <ul>
            {userRooms.map((room, index) => (
              <li key={index} onClick={() => {
                setRoom(room);
                navigate('/chat'); 
              }}>
                {room}
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous rooms</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
