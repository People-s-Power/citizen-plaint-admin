import React from "react"
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react"

interface GlobalActiveCallUIProps {
  inCall: boolean;
  currentCallType: 'audio' | 'video';
  activeCallUserName: string;
  endCall: () => void;
  toggleVideo: () => Promise<boolean> | boolean;
  toggleAudio: () => boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  remoteAudio: React.RefObject<HTMLDivElement | null>;
  localVideo: React.RefObject<HTMLDivElement | null>;
  remoteVideo: React.RefObject<HTMLDivElement | null>;
}

export const GlobalActiveCallUI: React.FC<GlobalActiveCallUIProps> = ({
  inCall,
  currentCallType,
  activeCallUserName,
  endCall,
  toggleVideo,
  toggleAudio,
  isVideoEnabled,
  isAudioEnabled,
  remoteAudio,
  localVideo,
  remoteVideo,
}) => {
  if (!inCall) return null;

  const handleToggleVideo = async () => {
    await toggleVideo();
  };

  const handleToggleAudio = () => {
    toggleAudio();
  };

  // Audio call UI
  if (currentCallType === "audio") {
    return (
      <>
        {/* Remote audio container - Twilio will attach audio tracks here */}
        <div ref={remoteAudio} style={{ display: 'none' }} />

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/90 backdrop-blur-lg p-6 z-[9998] shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-30" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{activeCallUserName || "Unknown"}</p>
                <p className="text-emerald-300 text-sm">Audio Call in Progress</p>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center gap-4">
              {/* Mute Button */}
              <button
                onClick={handleToggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isAudioEnabled ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600"
                }`}
                title={isAudioEnabled ? "Mute" : "Unmute"}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-105"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Video call UI
  return (
    <>
      {/* Remote audio container - Twilio will attach audio tracks here */}
      <div ref={remoteAudio} style={{ display: 'none' }} />

      <div className="fixed inset-0 bg-black z-[9998] flex flex-col justify-center">
        {/* Video Container */}
        <div className="flex-1 relative items-center flex justify-center">
          {/* Remote video container - Twilio will attach video tracks here */}
          <div 
            ref={remoteVideo}
            className="w-full md:w-fit h-full max-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-900"
            style={{ 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Placeholder if no video yet */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">
                    {activeCallUserName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <p className="text-white text-lg">{activeCallUserName || "Connecting..."}</p>
              </div>
            </div>
          </div>

          {/* Local video container (picture-in-picture) - Twilio will attach local video here */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <div 
              ref={localVideo}
              className="w-full h-full relative"
              style={{
                transform: "scaleX(-1)", // Mirror local video
                overflow: 'hidden'
              }}
            >
              {/* Placeholder for local video */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700 pointer-events-none">
                <Video className="w-8 h-8 text-white/50" />
              </div>
            </div>
          </div>

          {/* Participant name overlay */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-medium">{activeCallUserName || "Unknown"}</p>
          </div>

          {/* Connection quality indicator */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white text-sm">Connected</span>
            </div>
          </div>
        </div>

        {/* Call controls bar */}
        <div className="bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-center gap-6">
            {/* Mute Audio Button */}
            <button
              onClick={handleToggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isAudioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
              }`}
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
            </button>

            {/* End Call Button */}
            <button 
              onClick={endCall} 
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              title="End Call"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            {/* Toggle Video Button */}
            <button
              onClick={handleToggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isVideoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
              }`}
              title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
            >
              {isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}