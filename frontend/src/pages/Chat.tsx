import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { io, Socket } from 'socket.io-client';
import './Chat.css';

interface Message {
  id: number;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface SystemMessage {
  name: string;
  message: string;
}

export const Chat: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect to socket
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5001';
    
    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],  // polling first — more reliable through proxies
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      withCredentials: true,
      auth: { token },
    });

    setSocket(newSocket);

    // Join chat with user data
    if (user) {
      newSocket.emit('join', {
        id: user._id || user.id,
        name: user.name,
        email: user.email
      });
    }

    // Listen for messages
    newSocket.on('receive-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for user joined/left
    newSocket.on('user-joined', (data: SystemMessage) => {
      console.log(data.message);
    });

    newSocket.on('user-left', (data: SystemMessage) => {
      console.log(data.message);
    });

    // Listen for typing indicator
    newSocket.on('user-typing', (data: { userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName);
        setIsTyping(true);
      } else {
        setIsTyping(false);
        setTypingUser('');
      }
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !socket || !user) return;

    socket.emit('send-message', {
      userId: user._id || user.id,
      userName: user.name,
      message: inputMessage.trim()
    });

    setInputMessage('');
    
    // Stop typing indicator
    socket.emit('typing', {
      userName: user.name,
      isTyping: false
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!socket || !user) return;

    // Emit typing event
    socket.emit('typing', {
      userName: user.name,
      isTyping: true
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        userName: user.name,
        isTyping: false
      });
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Team Chat</h2>
        <p>Real-time messaging with your team</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              (user?._id || user?.id) === msg.userId ? 'message-own' : 'message-other'
            }`}
          >
            <div className="message-header">
              <span className="message-author">{msg.userName}</span>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span>{typingUser} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={!inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
