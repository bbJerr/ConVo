import { useEffect, useState, useRef } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from "../../config/firebase";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import "./chatPage.css";

const Chat = (props) => {   
  const { room } = props;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
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
  };

  const goBack = () => {
    navigate('/'); // Navigate back to the home page
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
          <div ref={messagesEndRef} />
        </div> 
        <form onSubmit={handleSubmit} className="new-message-form">
          <input 
            placeholder="Type your message here..."
            className="new-message-input"   
            onChange={(e) => setNewMessage(e.target.value)}               
            value={newMessage}
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
