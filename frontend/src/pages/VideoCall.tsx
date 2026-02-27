import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { io, Socket } from 'socket.io-client';
import './VideoCall.css';

export const VideoCall: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // TURN server — required in production behind NAT
      ...(import.meta.env.VITE_TURN_URL
        ? [
            {
              urls: import.meta.env.VITE_TURN_URL,
              username: import.meta.env.VITE_TURN_USERNAME ?? '',
              credential: import.meta.env.VITE_TURN_CREDENTIAL ?? '',
            },
          ]
        : []),
    ],
  };

  // Connect to socket
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5001';
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    setSocket(newSocket);

    if (user) {
      newSocket.emit('video-join', {
        id: user._id || user.id,
        name: user.name,
      });
    }

    // Listen for online users
    newSocket.on('online-users', (users: Array<{ id: string; name: string }>) => {
      setOnlineUsers(users.filter(u => u.id !== (user?._id || user?.id)));
    });

    // Listen for incoming call offer
    newSocket.on('video-offer', async ({ from, fromName, offer }: any) => {
      await handleReceiveOffer(from, fromName, offer, newSocket);
    });

    // Listen for answer
    newSocket.on('video-answer', async ({ from, answer }: any) => {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for ICE candidates
    newSocket.on('ice-candidate', async ({ from, candidate }: any) => {
      const peerConnection = peerConnectionsRef.current.get(from);
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Listen for user left
    newSocket.on('user-left-video', ({ userId }: any) => {
      handleUserLeft(userId);
    });

    return () => {
      newSocket.close();
      stopCall();
    };
  }, [user]);

  const handleReceiveOffer = async (from: string, _fromName: string, offer: any, socket: Socket) => {
    if (!localStreamRef.current) {
      await startLocalStream();
    }

    const peerConnection = createPeerConnection(from, socket);
    peerConnectionsRef.current.set(from, peerConnection);

    localStreamRef.current?.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('video-answer', {
      to: from,
      answer: answer,
    });

    setInCall(true);
  };

  const createPeerConnection = (userId: string, socket: Socket): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(iceServers);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, remoteStream);
        return newMap;
      });
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        handleUserLeft(userId);
      }
    };

    return peerConnection;
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      throw error;
    }
  };

  const startCall = async (targetUserId: string) => {
    try {
      if (!socket) return;

      await startLocalStream();
      
      const peerConnection = createPeerConnection(targetUserId, socket);
      peerConnectionsRef.current.set(targetUserId, peerConnection);

      localStreamRef.current?.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('video-offer', {
        to: targetUserId,
        offer: offer,
      });

      setInCall(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const stopCall = () => {
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Clear remote streams
    setRemoteStreams(new Map());
    setInCall(false);

    if (socket) {
      socket.emit('leave-video');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleUserLeft = (userId: string) => {
    const peerConnection = peerConnectionsRef.current.get(userId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(userId);
    }

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  };

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <h2>Video Call</h2>
        <p>Connect with your team face-to-face</p>
      </div>

      {!inCall ? (
        <div className="video-call-lobby">
          <h3>Online Users</h3>
          {onlineUsers.length === 0 ? (
            <p className="no-users">No users online</p>
          ) : (
            <div className="user-list">
              {onlineUsers.map(onlineUser => (
                <div key={onlineUser.id} className="user-item">
                  <span className="user-name">{onlineUser.name}</span>
                  <button
                    className="call-btn"
                    onClick={() => startCall(onlineUser.id)}
                  >
                    📞 Call
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="video-call-room">
          <div className="video-grid">
            {/* Local Video */}
            <div className="video-item local-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
              />
              <div className="video-label">You</div>
            </div>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <RemoteVideo key={userId} stream={stream} userId={userId} />
            ))}
          </div>

          <div className="video-controls">
            <button
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            
            <button
              className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? '📷' : '📹'}
            </button>
            
            <button
              className="control-btn end-call"
              onClick={stopCall}
              title="End call"
            >
              📞 End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface RemoteVideoProps {
  stream: MediaStream;
  userId: string;
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-item remote-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
      />
      <div className="video-label">Remote User</div>
    </div>
  );
};
