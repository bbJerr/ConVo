import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc, setDoc, arrayRemove } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV } from "react-icons/fa";
import "./homePage.css";

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

const removeRoomFromFirestore = async (userId, roomName) => {
  const userRoomsRef = doc(db, 'userRooms', userId);
  const userRoomsDoc = await getDoc(userRoomsRef);

  if (userRoomsDoc.exists()) {
    const rooms = userRoomsDoc.data().rooms || [];
    if (rooms.includes(roomName)) {
      await updateDoc(userRoomsRef, { rooms: arrayRemove(roomName) });
    }
  }
};

const removeUserFromRoom = async (roomName, userId) => {
  const roomUsersRef = doc(db, 'roomUsers', roomName);
  const roomUsersDoc = await getDoc(roomUsersRef);

  if (roomUsersDoc.exists()) {
    const existingUsers = roomUsersDoc.data().users || [];
    if (existingUsers.includes(userId)) {
      await updateDoc(roomUsersRef, { users: arrayRemove(userId) });
    }
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
      return userNames;
    } else {
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); 
  const [showOptions, setShowOptions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (userId) {
        try {
          const rooms = await loadUserRooms(userId);
          setUserRooms(rooms);

          const usersPromises = rooms.map(room => loadRoomUsers(room));
          const usersResults = await Promise.all(usersPromises);

          const roomUsersData = rooms.reduce((acc, room, index) => {
            acc[room] = usersResults[index];
            return acc;
          }, {});

          setRoomUsers(roomUsersData);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserRooms();
  }, [userId]);

  const enterChatRoom = async () => {
    if (newRoom.trim()) {
      const roomName = newRoom.trim();
      setRoom(roomName);
      localStorage.setItem("currentRoom", roomName);
  
      if (userId) {
        try {
          await saveRoomToFirestore(userId, roomName);
          await addUserToRoom(roomName, userId);
  
          const roomUsersRef = doc(db, 'roomUsers', roomName);
          const roomUsersDoc = await getDoc(roomUsersRef);
  
          if (!roomUsersDoc.exists()) {
            await setDoc(roomUsersRef, { users: [] });
          }
  
          setUserRooms(prev => [...prev, roomName]);
        } catch (error) {
          console.error("Error saving room to Firestore:", error);
        }
      }
  
      setNewRoom("");
      navigate('/chat');
    }
  };

  const handleLeaveRoom = async (roomName) => {
    if (userId) {
      try {
        await removeRoomFromFirestore(userId, roomName);
        await removeUserFromRoom(roomName, userId);
        setUserRooms(prev => prev.filter(room => room !== roomName));
      } catch (error) {
        console.error("Error removing room:", error);
      }
    }
  };

  const handleOptionsToggle = (roomName) => {
    setShowOptions(prev => ({
      ...prev,
      [roomName]: !prev[roomName],
    }));
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
      <div className="room-list">
        {loading ? (
          <p>Loading chat rooms...</p>
        ) : userRooms.length > 0 ? (
          <ul>
            {userRooms.map((room, index) => (
              <li key={index} onClick={() => {
                setRoom(room);
                navigate('/chat');
              }}>
                <div className="room-list-item">
                  <div className="room-list-name">
                    {room}
                  </div>
                  <FaEllipsisV
                    className="options-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionsToggle(room);
                    }}
                  />
                </div>
                {showOptions[room] && (
                  <div className="options-dropdown">
                    <button
                      className="leave-room"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveRoom(room);
                      }}
                    >
                      Leave Room
                    </button>
                  </div>
                )}
                {roomUsers[room] && roomUsers[room].length > 0 && (
                  <ul className="user-names">
                    {roomUsers[room].map((user, i) => (
                      <li key={i}>{user}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No chat rooms joined yet</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
