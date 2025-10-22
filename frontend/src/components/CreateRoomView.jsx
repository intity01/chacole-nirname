// src/components/CreateRoomView.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Copy, Check } from '@/components/ui/icons.jsx';

function CreateRoomView({ roomId, onConnectToRoom, onBackHome }) {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    const link = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      alert('คัดลอกรหัสห้องแล้ว!');
    }).catch(() => {
      alert('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">ห้องแชทของคุณพร้อมแล้ว!</CardTitle>
          <p className="text-gray-600 mt-2">แชร์รหัสห้องหรือลิงก์ให้เพื่อนเพื่อเข้าร่วม</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">รหัสห้อง</p>
            <div 
              className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={copyRoomId}
              title="คลิกเพื่อคัดลอก"
            >
              <p className="text-3xl font-bold font-mono text-gray-800">{roomId}</p>
              <p className="text-xs text-gray-500 mt-1">คลิกเพื่อคัดลอก</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 เคล็ดลับ:</strong> คัดลอกลิงก์ด้านล่างแล้วส่งให้เพื่อน เพื่อนจะเข้าห้องได้ทันทีโดยไม่ต้องพิมพ์รหัส
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={copyRoomLink} 
              className="w-full h-12" 
              variant="outline"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  คัดลอกแล้ว!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  คัดลอกลิงก์เชิญเพื่อน
                </>
              )}
            </Button>
            <Button 
              onClick={() => onConnectToRoom(roomId)} 
              className="w-full h-12 text-lg" 
              size="lg"
            >
              เข้าสู่ห้องแชท
            </Button>
          </div>
          
          <Button onClick={onBackHome} variant="ghost" className="w-full">
            กลับหน้าแรก
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateRoomView;

