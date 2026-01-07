import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useWebRTCContext } from '@/context/WebRTCContext';

interface CallInitiatorProps {
  targetUserId: string;
  targetUserName: string;
}

export const CallInitiator: React.FC<CallInitiatorProps> = ({
  targetUserId,
  targetUserName,
}) => {

    const { isConnected, isCalling, currentCallType, startCall, endCall } = useWebRTCContext();

  const handleStartAudioCall = () => {
    startCall(targetUserId, targetUserName, 'audio');
  };

  const handleStartVideoCall = () => {
    startCall(targetUserId, targetUserName, 'video');
  };

  return (
    <div className="h-fit">
      {!isCalling && (
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full ${
              isConnected
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                : 'bg-gray-500'
            } flex items-center justify-center shadow-lg`}
          >
            <Phone className="w-4 h-4 text-white" color='white' />
          </div>

          <button
            onClick={handleStartAudioCall}
            disabled={!targetUserId || !isConnected}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Phone className="w-5 h-5" color='white' />
            Audio Call
          </button>

          <button
            onClick={handleStartVideoCall}
            disabled={!targetUserId || !isConnected}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Video className="w-5 h-5" color='white' />
            Video Call
          </button>
        </div>
      )}

      {isCalling && (
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              {currentCallType === 'video' ? (
                <Video className="w-4 h-4 text-white" />
              ) : (
                <Phone className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
            <div
              className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"
              style={{ animationDelay: '0.5s' }}
            />
          </div>

          <span className="text-slate-600">
            {currentCallType === 'video' ? 'Video calling...' : 'Calling...'}
          </span>

          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
          >
            <PhoneOff className="w-5 h-5" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};