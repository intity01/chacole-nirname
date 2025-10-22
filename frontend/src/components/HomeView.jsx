// src/components/HomeView.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { MessageCircle, Clock, X } from '@/components/ui/icons.jsx';
import { storageService } from '../services/storageService';
import { useToast } from './ui/toast';

function HomeView({ onCreateRoom, onJoinRoom }) {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [roomHistory, setRoomHistory] = useState([]);
  const toast = useToast();

  // โหลดประวัติห้องเมื่อ component mount
  useEffect(() => {
    const history = storageService.getRoomHistory();
    setRoomHistory(history);
  }, []);

  const handleJoin = () => {
    if (!joinRoomId.trim()) {
      toast.warning('กรุณาใส่รหัสห้อง');
      return;
    }
    onJoinRoom(joinRoomId.trim().toUpperCase());
  };

  const handleJoinFromHistory = (roomId) => {
    onJoinRoom(roomId);
  };

  const handleRemoveFromHistory = (roomId, e) => {
    e.stopPropagation(); // ป้องกันไม่ให้ trigger handleJoinFromHistory
    storageService.removeFromHistory(roomId);
    setRoomHistory(storageService.getRoomHistory());
    toast.success('ลบออกจากประวัติแล้ว');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">แชทนิรนาม</CardTitle>
          <p className="text-gray-600 mt-2">สนทนาแบบส่วนตัวและปลอดภัย</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={onCreateRoom} className="w-full h-12 text-lg" size="lg">
            สร้างห้องแชทใหม่
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">หรือ</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="ใส่รหัสห้อง (เช่น ABC123)"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              className="text-center text-lg font-mono uppercase"
            />
            <Button onClick={handleJoin} variant="outline" className="w-full h-12 text-lg" size="lg">
              เข้าร่วมห้องแชท
            </Button>
          </div>

          {/* ประวัติห้องที่เคยเข้า */}
          {roomHistory.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">ห้องล่าสุด</span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {roomHistory.map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => handleJoinFromHistory(room.roomId)}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono font-semibold text-gray-800 truncate">
                          {room.roomId}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {room.lastVisit}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveFromHistory(room.roomId, e)}
                      className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="ลบออกจากประวัติ"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeView;

