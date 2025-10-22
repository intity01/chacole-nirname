// src/components/ChatView.jsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MessageCircle, Users, Send, LogOut, Volume2, VolumeX } from '@/components/ui/icons.jsx';
import { notificationService } from '../services/notificationService';

function ChatView({ roomId, userName, initialMessages, participantCount, isConnected, onSendMessage, onLeaveRoom, onTyping, typingUsers: externalTypingUsers }) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const typingUsers = externalTypingUsers || new Set();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevMessagesLengthRef = useRef(initialMessages.length);

  // Sync messages from App.jsx และเล่นเสียงเมื่อมีข้อความใหม่
  useEffect(() => {
    setMessages(initialMessages);
    
    // เล่นเสียงเมื่อมีข้อความใหม่ (ไม่ใช่ข้อความของตัวเอง)
    if (initialMessages.length > prevMessagesLengthRef.current) {
      const latestMessage = initialMessages[initialMessages.length - 1];
      if (latestMessage.type === 'message' && latestMessage.user_name !== userName && soundEnabled) {
        notificationService.playNotificationSound();
      }
    }
    prevMessagesLengthRef.current = initialMessages.length;
  }, [initialMessages, userName, soundEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, typingUsers]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
    
    // หยุด typing indicator เมื่อส่งข้อความ
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // ส่ง typing indicator
    if (onTyping && e.target.value.length > 0) {
      onTyping(true);
      
      // ตั้ง timeout เพื่อหยุด typing indicator ถ้าไม่มีการพิมพ์ต่อ
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000); // หยุดหลังจาก 2 วินาที
    } else if (onTyping && e.target.value.length === 0) {
      onTyping(false);
    }
  };



  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Responsive */}
      <div className="bg-white border-b px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-gray-800 text-sm sm:text-base truncate">ห้อง {roomId}</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">คุณคือ {userName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{participantCount}</span>
          </Badge>
          <Button 
            onClick={() => {
              const newState = notificationService.toggle();
              setSoundEnabled(newState);
            }} 
            variant="outline" 
            size="sm" 
            className="p-2"
            title={soundEnabled ? 'ปu0e34u0e14u0e40u0e2au0e35u0e22u0e07' : 'เu0e1bu0e34u0e14u0e40u0e2au0e35u0e22u0e07'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button onClick={onLeaveRoom} variant="outline" size="sm" className="hidden sm:inline-flex">
            ออก
          </Button>
          <Button onClick={onLeaveRoom} variant="outline" size="sm" className="sm:hidden p-2">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages - Responsive */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'system' ? 'justify-center' : msg.user_name === userName ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'system' ? (
              <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs sm:text-sm">
                {msg.message}
              </div>
            ) : (
              <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                msg.user_name === userName 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
              }`}>
                {msg.user_name !== userName && (
                  <p className="text-xs text-blue-600 mb-1 font-medium">{msg.user_name}</p>
                )}
                <p className="break-words text-sm sm:text-base">{msg.message}</p>
                <p className={`text-xs mt-1 text-right ${
                  msg.user_name === userName ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Array.from(typingUsers).join(', ')} กำลังพิมพ์...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Responsive & Touch-friendly */}
      <div className="bg-white border-t p-3 sm:p-4 safe-area-bottom">
        <div className="flex space-x-2">
          <Input
            placeholder="พิมพ์ข้อความ..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 text-base"
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 sm:px-6"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs sm:text-sm text-red-500 mt-2 text-center">
            กำลังเชื่อมต่อใหม่...
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatView;

