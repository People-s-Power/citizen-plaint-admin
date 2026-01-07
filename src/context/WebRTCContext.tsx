import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useTwilioVideo, CallType } from '@/hooks/useWebRTC';

interface IncomingCallInfo {
  name: string;
  userId: string;
  callType: CallType;
  roomName: string;
}

interface WebRTCContextType {
  isConnected: boolean;
  isCalling: boolean;
  inCall: boolean;
  currentCallType: CallType;
  connectionQuality: 'good' | 'poor' | 'disconnected';
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  incomingCall: IncomingCallInfo | null;
  activeCallUserName: string;
  startCall: (targetUserId: string, targetUserName: string, callType: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleVideo: () => Promise<boolean> | boolean;
  toggleAudio: () => boolean;
  remoteAudio: React.RefObject<HTMLDivElement | null>;
  localVideo: React.RefObject<HTMLDivElement | null>;
  remoteVideo: React.RefObject<HTMLDivElement | null>;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

interface WebRTCProviderProps {
  children: ReactNode;
  userId: string;
}

export const WebRTCProvider: React.FC<WebRTCProviderProps> = ({ children, userId }) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [activeCallUserName, setActiveCallUserName] = useState<string>('');

  const handleIncomingCall = (callerInfo: any) => {
    console.log('📞 Incoming call received in context:', callerInfo);
    setIncomingCall({
      name: callerInfo.name || 'Unknown',
      userId: callerInfo.userId,
      callType: callerInfo.callType,
      roomName: callerInfo.roomName,
    });
    setActiveCallUserName(callerInfo.name || 'Unknown');
  };

  const handleCallEnded = () => {
    console.log('📴 Call ended in context');
    setIncomingCall(null);
    setActiveCallUserName('');
  };

  const twilioVideo = useTwilioVideo({
    userId,
    onIncomingCall: handleIncomingCall,
    onCallEnded: handleCallEnded,
  });

  const startCall = async (targetUserId: string, targetUserName: string, callType: CallType) => {
    setActiveCallUserName(targetUserName);
    await twilioVideo.startCall(targetUserId, targetUserName, callType);
  };

  const acceptCall = async () => {
    setIncomingCall(null);
    await twilioVideo.acceptCall();
  };

  const rejectCall = () => {
    setIncomingCall(null);
    setActiveCallUserName('');
    twilioVideo.rejectCall();
  };

  const endCall = () => {
    setActiveCallUserName('');
    twilioVideo.endCall();
  };

  const value: WebRTCContextType = {
    ...twilioVideo,
    incomingCall,
    activeCallUserName,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };

  return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>;
};

export const useWebRTCContext = (): WebRTCContextType => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTCContext must be used within a WebRTCProvider');
  }
  return context;
};