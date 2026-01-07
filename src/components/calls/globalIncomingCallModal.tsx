import React, { useEffect, useRef } from "react"
import { Phone, PhoneOff, PhoneIncoming, X, Video } from "lucide-react"

interface IncomingCallInfo {
  name: string;
  userId: string;
  callType: 'audio' | 'video';
  roomName: string;
}

interface GlobalIncomingCallModalProps {
  incomingCall: IncomingCallInfo | null;
  acceptCall: () => void;
  rejectCall: () => void;
}

export const GlobalIncomingCallModal: React.FC<GlobalIncomingCallModalProps> = ({
  incomingCall,
  acceptCall,
  rejectCall,
}) => {
  const ringtoneRef = useRef<HTMLAudioElement | null>(null)

  // Play ringtone when incoming call arrives
  useEffect(() => {
    if (incomingCall && ringtoneRef.current) {
      console.log("Playing ringtone for incoming call")
      ringtoneRef.current.currentTime = 0
      ringtoneRef.current
        .play()
        .then(() => console.log("✓ Ringtone playing"))
        .catch((error) => {
          console.error("✗ Error playing ringtone:", error)
          // Retry after a short delay
          setTimeout(() => {
            ringtoneRef.current?.play().catch((e) => console.error("Ringtone play retry failed:", e))
          }, 100)
        })
    }

    // Cleanup: Stop ringtone when component unmounts or call ends
    return () => {
      if (ringtoneRef.current) {
        console.log("Stopping ringtone")
        ringtoneRef.current.pause()
        ringtoneRef.current.currentTime = 0
      }
    }
  }, [incomingCall])

  const handleAccept = () => {
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    acceptCall()
  }

  const handleReject = () => {
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    rejectCall()
  }

  // Don't render if no incoming call
  if (!incomingCall) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      {/* Ringtone Audio */}
      <audio 
        ref={ringtoneRef} 
        loop 
        preload="auto" 
        src="/sounds/ringtone.mp3" 
      />

      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={handleReject} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          title="Decline"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Call Info */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Call Icon with Animation */}
          <div className="relative w-16 h-16 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl">
              {incomingCall.callType === "video" ? (
                <Video className="w-7 h-7 text-white" />
              ) : (
                <PhoneIncoming className="w-7 h-7 text-white" />
              )}
            </div>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
            <div 
              className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"
              style={{ animationDelay: '0.3s' }}
            />
          </div>

          {/* Call Type */}
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Incoming {incomingCall.callType === "video" ? "Video Call" : "Audio Call"}
          </h3>

          {/* Caller Name */}
          <p className="text-slate-600 mb-6">
            from <strong>{incomingCall.name || "Unknown Caller"}</strong>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Accept Call"
            >
              <Phone className="w-6 h-6" />
            </button>

            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Optional: Additional Info */}
          <p className="text-xs text-slate-400 mt-4">
            {incomingCall.callType === "video" 
              ? "Camera and microphone access will be requested" 
              : "Microphone access will be requested"
            }
          </p>
        </div>
      </div>
    </div>
  )
}