// src/App.jsx
import { useState, useEffect } from 'react';
import HomeView from './components/HomeView';
import CreateRoomView from './components/CreateRoomView';
import ChatView from './components/ChatView';
import { apiService } from './services/apiService';
import { websocketService } from './services/websocketService';
import { ToastContainer, useToast } from './components/ui/toast';
import { notificationService } from './services/notificationService';
import { storageService } from './services/storageService';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'create', 'chat'
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const toast = useToast();

  // Request notification permission เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // ตรวจสu0e2du0e1a URL parameter เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
      // ถ้ามี room parameter ให้ auto-join
      console.log('Auto-joining room from URL:', roomParam);
      handleJoinRoom(roomParam.trim().toUpperCase());
      
      // ไม่ลบ parameter ออกจาก URL เพื่อให้ auto-join ทำงานได้
      // window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCreateRoom = async () => {
    try {
      const data = await apiService.createRoom();
      setRoomId(data.room_id);
      setCurrentView('create');
    } catch (error) {
      toast.error('ไม่สามารถสร้างห้องได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่');
    }
  };

  const handleJoinRoom = async (targetRoomId) => {
    // ตรวจสอบว่าห้องมีอยู่จริงก่อน connect WebSocket
    try {
      setIsConnecting(true);
      const roomInfo = await apiService.getRoomInfo(targetRoomId);
      
      if (roomInfo.error) {
        toast.error(`ไม่พบห้อง: ${roomInfo.error}\nกรุณาตรวจสอบรหัสห้องอีกครั้ง`);
        setIsConnecting(false);
        return;
      }
      
      // ถ้าห้องมีอยู่ ให้เชื่อมต่อ WebSocket
      setRoomId(targetRoomId);
      connectToWebSocket(targetRoomId);
    } catch (error) {
      console.error('Error checking room:', error);
      toast.error('ไม่สามารถตรวจสอบห้องได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      setIsConnecting(false);
    }
  };

  const resetState = () => {
    setCurrentView('home');
    setMessages([]);
    setUserName('');
    setRoomId('');
    setParticipantCount(0);
    setIsConnected(false);
    setIsConnecting(false);
  };
  
  const connectToWebSocket = (targetRoomId) => {
    websocketService.connect(targetRoomId, {
      onOpen: () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('WebSocket connected successfully');
      },
      onClose: () => {
        setIsConnected(false);
        setIsConnecting(false);
        
        // แสดง alert เฉพาะเมื่ออยู่ในห้องแชท
        if (currentView === 'chat') {
          toast.warning('การเชื่อมต่อหลุด กรุณาเชื่อมต่อใหม่อีกครั้ง');
          resetState();
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        
        // แสดงข้อความ error ที่ชัดเจน
        const errorMessage = error.message || 'ไม่สามารถเชื่อมต่อห้องแชทได้';
        
        if (!isConnected) {
          toast.error(errorMessage);
        } else {
          toast.error(`การเชื่อมต่อขาดหาย: ${errorMessage}`);
        }
        resetState();
      },
      onMessage: (data) => {
        switch (data.type) {
          case 'connected':
            setUserName(data.user_name);
            setParticipantCount(data.participant_count);
            setCurrentView('chat');
            setIsConnecting(false);
            // บu0e31u0e19u0e17u0e36u0e01u0e2bu0e49u0e2du0e07u0e17u0e35u0e48u0e40u0e02u0e49u0e32
            storageService.saveRoomHistory(roomId);
            break;
          case 'message':
            setMessages(prev => [...prev, data]);
            // Show push notification if not in focus and not own message
            if (document.hidden && data.user_name !== userName) {
              notificationService.showNotification(
                `${data.user_name} สu่งข้อความ`,
                {
                  body: data.message,
                  tag: 'chat-message',
                  requireInteraction: false
                }
              );
            }
            break;
          case 'user_joined':
            setParticipantCount(data.participant_count);
            setMessages(prev => [...prev, { type: 'system', message: `${data.user_name} เข้าร่วมห้อง` }]);
            break;
          case 'user_left':
            setParticipantCount(data.participant_count);
            setMessages(prev => [...prev, { type: 'system', message: `${data.user_name} ออกจากห้อง` }]);
            break;
          case 'typing':
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (data.is_typing) {
                newSet.add(data.user_name);
              } else {
                newSet.delete(data.user_name);
              }
              return newSet;
            });
            break;
          case 'error':
            toast.error(`เกิดข้อผิดพลาด: ${data.message}`);
            resetState();
            break;
        }
      },
    });
  };

  const handleSendMessage = (message) => {
    websocketService.sendMessage({
      type: 'message',
      message: message,
    });
  };

  const handleTyping = (isTyping) => {
    websocketService.sendMessage({
      type: 'typing',
      is_typing: isTyping,
    });
  };

  const handleLeaveRoom = () => {
    websocketService.disconnect();
    resetState();
  };

  const renderView = () => {
    // แสดงหน้า loading ขณะกำลังเชื่อมต่อ
    if (isConnecting) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-700">กำลังเชื่อมต่อห้อง {roomId}...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'create':
        return <CreateRoomView roomId={roomId} onConnectToRoom={handleJoinRoom} onBackHome={resetState} />;
      case 'chat':
        return (
          <ChatView
            roomId={roomId}
            userName={userName}
            initialMessages={messages}
            participantCount={participantCount}
            isConnected={isConnected}
            onSendMessage={handleSendMessage}
            onLeaveRoom={handleLeaveRoom}
            onTyping={handleTyping}
            typingUsers={typingUsers}
          />
        );
      case 'home':
      default:
        return <HomeView onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
}

export default App;

