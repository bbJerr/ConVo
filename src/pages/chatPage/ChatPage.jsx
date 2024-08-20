import { useEffect, useState, useRef } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from "../../config/firebase";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import "./chatPage.css";

const Chat = (props) => {   
  const { room } = props;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesRef = collection(db, "messages");
  const navigate = useNavigate();

  useEffect(() => {
    const queryMessages = query(
      messagesRef, 
      where("room", "==", room),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({...doc.data(), id: doc.id});
      });
      setMessages(messages);
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
      const typing = snapshot.docs.map(doc => doc.data().user);
      setTypingUsers(typing.filter(user => user !== auth.currentUser.displayName));
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
    const typingDocRef = doc(typingStatusRef, `${room}_${auth.currentUser.uid}`);

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
    navigate('/'); 
  };

  return (
    <div className="chat-bg">
      <div className="chat-container">
        <button className="go-back-button" onClick={goBack}><FaArrowLeft /></button>
        <div className="header"> 
          <h1>{room}</h1>
        </div>
        <div className="messages"> 
          {messages.map((message) => (
            <div className={`message ${message.user === auth.currentUser.displayName ? "own-message" : "other-message"}`} key={message.id}>
              {message.user !== auth.currentUser.displayName && (
                <span className="user">{message.user}:</span>
              )}
              {message.text}
            </div>              
          ))}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
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
      </div>
    </div>
  );
};

export default Chat;
