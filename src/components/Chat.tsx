import React, { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, DatabaseReference, get } from "firebase/database";
import { db } from '../firebase';
import { MessageCircle, X, Smile, Send } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Message {
  id: string;
  text: string;
  timestamp: number;
  username: string;
  isAdmin: boolean;
}

interface ChatProps {
  darkMode?: boolean;
}

const Chat: React.FC<ChatProps> = ({ darkMode = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      const chatRef = ref(db, 'chat');
      
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageList);
        }
      });

      return () => {
        // Cleanup subscription
        unsubscribe();
      };
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen && isUsernameSet) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, isUsernameSet]);

  useEffect(() => {
    setShowPasswordInput(username.toLowerCase() === 'admin');
  }, [username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      try {
        const chatRef = ref(db, 'chat');
        await push(chatRef, {
          text: newMessage,
          timestamp: Date.now(),
          username: username,
          isAdmin: isAdmin
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const verifyAdminPassword = async () => {
    try {
      const adminRef = ref(db, 'user/admin');
      const snapshot = await get(adminRef);
      const adminData = snapshot.val();
      
      if (adminData && adminData.password === password) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  };

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== '') {
      if (username.toLowerCase() === 'admin') {
        const isValidAdmin = await verifyAdminPassword();
        if (isValidAdmin) {
          setIsAdmin(true);
          setIsUsernameSet(true);
        } else {
          alert('Contraseña de administrador incorrecta');
        }
      } else {
        setIsUsernameSet(true);
      }
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const renderChatContent = () => {
    if (!isUsernameSet) {
      return (
        <form onSubmit={handleSetUsername} className="flex flex-col">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`border rounded-md px-2 py-1 mb-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 placeholder-gray-500'
            }`}
            placeholder="Ingresa tu nombre..."
          />
          {showPasswordInput && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border rounded-md px-2 py-1 mb-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
              }`}
              placeholder="Contraseña de administrador"
            />
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
          >
            Ingresar al chat
          </button>
        </form>
      );
    }

    return (
      <>
        <div className={`h-48 sm:h-64 md:h-80 overflow-y-auto mb-4 ${darkMode ? 'text-white' : ''}`} ref={chatContainerRef}>
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <p className="text-sm break-words">
                <span className={`font-bold ${message.isAdmin ? 'text-blue-400' : ''}`}>
                  {message.username}
                  {message.isAdmin && ' ✓'}:
                </span>{' '}
                {message.text}
              </p>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col relative">
          <div className="flex mb-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`flex-grow border rounded-l-md px-2 py-2 text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
              }`}
              placeholder="Escribe un mensaje..."
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`px-2 py-2 flex-shrink-0 ${
                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Smile size={20} />
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded-r-md flex items-center justify-center flex-shrink-0 hover:bg-blue-600"
            >
              <Send size={20} />
            </button>
          </div>
          {showEmojiPicker && (
            <div className="absolute right-0 bottom-full mb-2 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={darkMode ? 'dark' : 'light'} />
            </div>
          )}
        </form>
      </>
    );
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        <MessageCircle size={24} />
      </button>
      {isChatOpen && (
        <div className={`fixed bottom-20 right-4 shadow-md rounded-lg p-4 w-11/12 max-w-sm sm:w-80 md:w-96 z-40 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : ''}`}>Chat en tiempo real</h2>
            <button onClick={toggleChat} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
              <X size={20} />
            </button>
          </div>
          {renderChatContent()}
        </div>
      )}
    </>
  );
};

export default Chat;