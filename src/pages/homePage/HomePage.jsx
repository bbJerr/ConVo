import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { collection, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import "./homePage.css";

// Function to save a room to Firestore
const saveRoomToFirestore = async (userId, roomName) => {
  const userRoomsRef = doc(db, 'userRooms', userId);
  const userRoomsDoc = await getDoc(userRoomsRef);

  if (userRoomsDoc.exists()) {
    const rooms = userRoomsDoc.data().rooms || [];
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      await updateDoc(userRoomsRef, { rooms });
    }
  } else {
    await setDoc(userRoomsRef, { rooms: [roomName] });
  }
};

// Function to add a user to a specific room
const addUserToRoom = async (roomName, userId) => {
  const roomUsersRef = doc(db, 'roomUsers', roomName);
  const roomUsersDoc = await getDoc(roomUsersRef);

  if (roomUsersDoc.exists()) {
    const existingUsers = roomUsersDoc.data().users || [];
    if (!existingUsers.includes(userId)) {
      existingUsers.push(userId);
      await updateDoc(roomUsersRef, { users: existingUsers });
    }
  } else {
    await setDoc(roomUsersRef, { users: [userId] });
  }
};

// Function to load user rooms from Firestore
const loadUserRooms = async (userId) => {
  const userRoomsRef = doc(db, 'userRooms', userId);
  const userRoomsDoc = await getDoc(userRoomsRef);

  if (userRoomsDoc.exists()) {
    return userRoomsDoc.data().rooms;
  } else {
    return [];
  }
};

// Function to load users of a specific room
const loadRoomUsers = async (roomName) => {
  try {
    const roomUsersRef = doc(db, 'roomUsers', roomName);
    const roomUsersDoc = await getDoc(roomUsersRef);

    if (roomUsersDoc.exists()) {
      const userUIDs = roomUsersDoc.data().users || [];
      const userNamesPromises = userUIDs.map(async uid => {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        return userDoc.exists() ? userDoc.data().name : uid;
      });
      const userNames = await Promise.all(userNamesPromises);
      console.log(`Fetched users for room ${roomName}:`, userNames);
      return userNames;
    } else {
      console.log(`No users found for room ${roomName}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching room users:", error);
    return [];
  }
};

const HomePage = ({ setRoom }) => {
  const [userRooms, setUserRooms] = useState([]);
  const [roomUsers, setRoomUsers] = useState({});
  const [newRoom, setNewRoom] = useState("");
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (userId) {
        try {
          const rooms = await loadUserRooms(userId);
          console.log("Fetched rooms:", rooms);
          setUserRooms(rooms);

          const usersPromises = rooms.map(room => loadRoomUsers(room));
          const usersResults = await Promise.all(usersPromises);
          console.log("Fetched room users:", usersResults);
          
          const roomUsersData = rooms.reduce((acc, room, index) => {
            acc[room] = usersResults[index];
            return acc;
          }, {});
          
          setRoomUsers(roomUsersData);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };

    fetchUserRooms();
  }, [userId]);

  const enterChatRoom = async () => {
    if (newRoom.trim()) {
      const roomName = newRoom.trim();
      setRoom(roomName);

      if (userId) {
        try {
          console.log(`Saving room ${roomName} for user ${userId}`);

          await saveRoomToFirestore(userId, roomName);
          await addUserToRoom(roomName, userId);

          const roomUsersRef = doc(db, 'roomUsers', roomName);
          const roomUsersDoc = await getDoc(roomUsersRef);

          if (!roomUsersDoc.exists()) {
            await setDoc(roomUsersRef, { users: [] });
            console.log(`Room ${roomName} created in roomUsers collection.`);
          }

          setUserRooms(prev => [...prev, roomName]);
          console.log("Room saved and state updated.");
        } catch (error) {
          console.error("Error saving room to Firestore:", error);
        }
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
      <div className="room-label-container">
        <label className="room-label">Enter Chat Room:</label>
        <div className="room-input-container">
          <input
            className="room-name-input"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type room name"
          />
          <button className="enter-chat" onClick={enterChatRoom}>Enter</button>
        </div>
      </div>
      <div className="previous-rooms">
        {userRooms.length > 0 ? (
          <ul>
            {userRooms.map((room, index) => (
              <li key={index} onClick={() => {
                setRoom(room);
                navigate('/chat'); 
              }}>
                {room}
                {roomUsers[room] && roomUsers[room].length > 0 && (
                  <ul>
                    {roomUsers[room].map((user, i) => (
                      <li key={i}>{user}</li>
                    ))}
                  </ul>
                )}
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
