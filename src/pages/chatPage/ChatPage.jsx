import { useEffect, useState, useRef } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

// Sound alert for new messages -nic
const notificationSound = new Audio("/sound/notif.mp3");

const Chat = (props) => {
  const { room } = props;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesRef = collection(db, "messages");
  const navigate = useNavigate();

  // Use effect for fetching messages and triggering toast notification -nic
  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ ...doc.data(), id: doc.id });
      });

      // Trigger toast notification for new messages from others
      if (newMessages.length > messages.length) {
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.user !== auth.currentUser.displayName) {
          showToast(lastMessage);
          playNotificationSound();
        }
      }

      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const typingStatusRef = collection(db, "typingStatuses");
    const q = query(typingStatusRef, where("room", "==", room));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing = snapshot.docs.map((doc) => doc.data().user);
      setTypingUsers(
        typing.filter((user) => user !== auth.currentUser.displayName)
      );
    });

    return () => unsubscribe();
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
    });

    setNewMessage("");
    handleTyping(false);
  };

  const handleTyping = async (isTyping) => {
    const typingStatusRef = collection(db, "typingStatuses");
    const typingDocRef = doc(
      typingStatusRef,
      `${room}_${auth.currentUser.uid}`
    );

    if (isTyping) {
      await setDoc(typingDocRef, {
        user: auth.currentUser.displayName,
        room,
        typing: true,
      });
    } else {
      await deleteDoc(typingDocRef);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping(e.target.value !== "");
  };

  const handleBlur = () => {
    handleTyping(false);
  };

  const goBack = () => {
    navigate("/");
  };

  const handleUserClick = (name) => {
    navigate(`/profile/${name}`);
  };

  // Function to show toast notification -nic
  const showToast = (message) => {
    toast.info(`${message.user}: ${message.text}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "custom-toast",
      bodyClassName: "custom-toast-body",
      progressClassName: "custom-toast-progress",
      icon: (
        <img
          src="/convo-logo.png"
          alt="ConVo Icon"
          style={{ width: "22px", height: "22px", marginRight: "10px" }}
        />
      ), // Custom image
    });
  };

  // Function to play notification sound -nic
  const playNotificationSound = () => {
    notificationSound
      .play()
      .catch((error) =>
        console.error("Error playing notification sound:", error)
      );
  };

  return (
    <div className="chat-bg">
      <div className="chat-container">
        <button className="go-back-button" onClick={goBack}>
          <FaArrowLeft />
        </button>
        <div className="header">
          <h1>{room}</h1>
        </div>
        <div className="messages">
          {messages.map((message) => (
            <div
              className={`message ${
                message.user === auth.currentUser.displayName
                  ? "own-message"
                  : "other-message"
              }`}
              key={message.id}
            >
              {message.user !== auth.currentUser.displayName && (
                <span
                  className="user"
                  onClick={() => handleUserClick(message.user)}
                >
                  {message.user}:{" "}
                  <span className="hover-text">View profile</span>
                </span>
              )}
              {message.text}
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="new-message-form">
          <input
            placeholder="Type your message here..."
            className="new-message-input"
            onChange={handleInputChange}
            value={newMessage}
            onBlur={handleBlur}
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>

        {/* Toast notification container  -nic*/}
        <ToastContainer toastClassName="custom-toast-container" />
      </div>
    </div>
  );
};

export default Chat;
