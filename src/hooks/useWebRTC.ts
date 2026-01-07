import { SERVER_URL } from '@/pages/_app';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Video, { 
  Room, 
  LocalVideoTrack, 
  LocalAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteAudioTrack,
  RemoteVideoTrack,
  LocalParticipant,
  CreateLocalTrackOptions
} from 'twilio-video';

interface UseTwilioVideoProps {
  userId: string;
  onIncomingCall?: (callerInfo: any) => void;
  onCallEnded?: () => void;
}

export type CallType = 'audio' | 'video';

export const useTwilioVideo = ({ userId, onIncomingCall, onCallEnded }: UseTwilioVideoProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<CallType>('audio');
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'disconnected'>('good');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const room = useRef<Room | null>(null);
  const localVideoTrack = useRef<LocalVideoTrack | null>(null);
  const localAudioTrack = useRef<LocalAudioTrack | null>(null);
  
  const remoteAudio = useRef<HTMLDivElement | null>(null);
  const localVideo = useRef<HTMLDivElement | null>(null);
  const remoteVideo = useRef<HTMLDivElement | null>(null);
  
  const currentRoomName = useRef<string | null>(null);
  const currentTargetUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      console.error('userId is required for Twilio Video connection');
      return;
    }

    const socketInstance = io(SERVER_URL, {
      query: { user_id: userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('register', { userId });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('✗ Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', ({ from, callType, roomName }) => {
      setCurrentCallType(callType || 'audio');
      onIncomingCall?.({ ...from, callType, roomName });
      
      (window as any).__pendingTwilioCall = { from, callType, roomName };
    });

    socket.on('call-accepted', async ({ roomName, acceptedBy }) => {
      setIsCalling(false);
      setInCall(true);
    });

    socket.on('call-rejected', ({ rejectedBy }) => {
      endCall();
      alert('Call was rejected');
    });

    socket.on('call-ended', ({ roomName, endedBy }) => {
      endCall();
      onCallEnded?.();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket, onIncomingCall, onCallEnded]);

  const getAccessToken = async (roomName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('get-video-token', 
        { userId, roomName },
        (response: any) => {
          if (response.success && response.token) {
            resolve(response.token);
          } else {
            console.error('✗ Failed to get token:', response.error);
            reject(new Error(response.error || 'Failed to get token'));
          }
        }
      );
    });
  };

  const attachTrack = useCallback((track: RemoteTrack | LocalVideoTrack | LocalAudioTrack, container: HTMLDivElement | null) => {
    if (!container) {
      console.warn('⚠ Container not available for track attachment');
      return;
    }

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (track.kind === 'video') {
      const videoTrack = track as RemoteVideoTrack | LocalVideoTrack;
      const videoElement = videoTrack.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      container.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      const audioTrack = track as RemoteAudioTrack | LocalAudioTrack;
      const audioElement = audioTrack.attach();
      audioElement.autoplay = true;
      container.appendChild(audioElement);
    }
  }, []);

  const handleParticipant = useCallback((participant: RemoteParticipant) => {

    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed && publication.track) {
        if (publication.track.kind === 'video') {
          attachTrack(publication.track, remoteVideo.current);
        } else if (publication.track.kind === 'audio') {
          attachTrack(publication.track, remoteAudio.current);
        }
      }
    });

    participant.on('trackSubscribed', (track) => {
      if (track.kind === 'video') {
        attachTrack(track, remoteVideo.current);
      } else if (track.kind === 'audio') {
        attachTrack(track, remoteAudio.current);
      }
    });

    participant.on('trackUnsubscribed', (track) => {
      if (track.kind === 'audio' || track.kind === 'video') {
        track.detach().forEach(el => el.remove());
      }
    });
  }, [attachTrack]);

  const connectToRoom = async (roomName: string, callType: CallType) => {
    try {

      const token = await getAccessToken(roomName);

      const createLocalTracksOptions: any = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callType === 'video' ? {
          width: 1280,
          height: 720,
          frameRate: 24,
        } : false,
      };

      const localTracks = await Video.createLocalTracks(createLocalTracksOptions);

      localTracks.forEach((track) => {
        if (track.kind === 'video') {
          localVideoTrack.current = track as LocalVideoTrack;
          if (localVideo.current) {
            attachTrack(track, localVideo.current);
          } else {
            console.warn('⚠ Local video container not ready');
          }
        } else if (track.kind === 'audio') {
          localAudioTrack.current = track as LocalAudioTrack;
        }
      });

      const connectedRoom = await Video.connect(token, {
        name: roomName,
        tracks: localTracks,
        audio: true,
        video: callType === 'video',
        networkQuality: {
          local: 1,
          remote: 1,
        },
      });

      room.current = connectedRoom;
      currentRoomName.current = roomName;

      connectedRoom.participants.forEach(handleParticipant);

      connectedRoom.on('participantConnected', handleParticipant);

      connectedRoom.on('participantDisconnected', (participant) => {
      });

      connectedRoom.on('disconnected', (room) => {
        room.localParticipant.tracks.forEach((publication) => {
          if (publication.track) {
            if (publication.track.kind === 'audio' || publication.track.kind === 'video') {
              publication.track.stop();
            }
          }
        });
      });

      connectedRoom.localParticipant.on('networkQualityLevelChanged', (level) => {
        if (level >= 3) {
          setConnectionQuality('good');
        } else if (level >= 1) {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('disconnected');
        }
      });

      socket?.emit('joined-room', { roomName });

      setInCall(true);
      setIsCalling(false);

      return connectedRoom;
    } catch (error) {
      console.error('✗ Error connecting to room:', error);
      throw error;
    }
  };

  const startCall = async (
    targetUserId: string, 
    targetUserName: string, 
    callType: CallType = 'audio'
  ) => {
    try {
      setIsCalling(true);
      setCurrentCallType(callType);
      setIsVideoEnabled(callType === 'video');
      currentTargetUserId.current = targetUserId;

      const roomName = `room_${userId}_${targetUserId}_${Date.now()}`;
      currentRoomName.current = roomName;

      socket?.emit('call-user', {
        targetUserId,
        callerInfo: {
          userId,
          name: targetUserName,
        },
        callType,
        roomName,
      });

      await connectToRoom(roomName, callType);

    } catch (error) {
      console.error('✗ Error starting call:', error);
      setIsCalling(false);
      throw error;
    }
  };

  const acceptCall = async () => {
    try {
      const pendingCall = (window as any).__pendingTwilioCall;
      if (!pendingCall) {
        throw new Error('No pending call');
      }

      const { from, callType, roomName } = pendingCall;
      
      setCurrentCallType(callType || 'audio');
      setIsVideoEnabled(callType === 'video');
      currentTargetUserId.current = from.userId;
      currentRoomName.current = roomName;

      socket?.emit('accept-call', {
        callerUserId: from.userId,
        roomName,
      });

      await connectToRoom(roomName, callType);

      delete (window as any).__pendingTwilioCall;
    } catch (error) {
      console.error('✗ Error accepting call:', error);
      throw error;
    }
  };

  const rejectCall = () => {
    const pendingCall = (window as any).__pendingTwilioCall;
    if (pendingCall) {
      const { from, roomName } = pendingCall;
      
      socket?.emit('reject-call', {
        callerUserId: from.userId,
        roomName,
      });
      
      delete (window as any).__pendingTwilioCall;
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack.current) {
      console.warn('⚠ No local video track to toggle');
      return false;
    }

    const enabled = !localVideoTrack.current.isEnabled;
    
    if (enabled) {
      localVideoTrack.current.enable();
    } else {
      localVideoTrack.current.disable();
    }
    
    setIsVideoEnabled(enabled);
    return enabled;
  };

  const toggleAudio = () => {
    if (!localAudioTrack.current) {
      console.warn('⚠ No local audio track to toggle');
      return false;
    }

    const enabled = !localAudioTrack.current.isEnabled;
    
    if (enabled) {
      localAudioTrack.current.enable();
    } else {
      localAudioTrack.current.disable();
    }
    
    setIsAudioEnabled(enabled);
    return enabled;
  };

  const endCall = () => {

    if (room.current) {
      room.current.disconnect();
      room.current = null;
    }

    if (localVideoTrack.current) {
      localVideoTrack.current.stop();
      localVideoTrack.current = null;
    }

    if (localAudioTrack.current) {
      localAudioTrack.current.stop();
      localAudioTrack.current = null;
    }

    if (localVideo.current) {
      while (localVideo.current.firstChild) {
        localVideo.current.removeChild(localVideo.current.firstChild);
      }
    }
    if (remoteVideo.current) {
      while (remoteVideo.current.firstChild) {
        remoteVideo.current.removeChild(remoteVideo.current.firstChild);
      }
    }
    if (remoteAudio.current) {
      while (remoteAudio.current.firstChild) {
        remoteAudio.current.removeChild(remoteAudio.current.firstChild);
      }
    }

    setInCall(false);
    setIsCalling(false);
    setCurrentCallType('audio');
    setConnectionQuality('good');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);

  };

  const endCallAndNotify = () => {

    const roomName = currentRoomName.current;
    const targetUserId = currentTargetUserId.current;

    if (roomName) {
      socket?.emit('end-call', { 
        roomName,
        targetUserId,
      });
      
      socket?.emit('left-room', { roomName });
    }

    endCall();

    currentRoomName.current = null;
    currentTargetUserId.current = null;
  };

  return {
    isConnected,
    isCalling,
    inCall,
    currentCallType,
    connectionQuality,
    isVideoEnabled,
    isAudioEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall: endCallAndNotify,
    toggleVideo,
    toggleAudio,
    remoteAudio,
    localVideo,
    remoteVideo,
  };
};