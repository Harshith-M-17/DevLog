# Video Call Feature

This project now includes a peer-to-peer video calling feature using WebRTC and Socket.io.

## Features

- **Real-time Video Calling**: Connect with team members via video
- **One-to-One Calls**: Start video calls with any online user
- **Audio/Video Controls**: Mute/unmute microphone and turn camera on/off
- **Multiple Participants**: Support for multiple simultaneous connections
- **Auto-reconnection**: Handles network issues gracefully

## How It Works

### Frontend (WebRTC)
- Uses WebRTC's `RTCPeerConnection` for peer-to-peer video streaming
- Camera and microphone access via `getUserMedia` API
- ICE servers (STUN) for NAT traversal using Google's public STUN servers

### Backend (Signaling)
- Socket.io server handles signaling (offer/answer/ICE candidates exchange)
- Tracks online users in the video call lobby
- Relays connection information between peers

## Usage

1. **Navigate to Video Call**: Click "Video Call" in the navbar
2. **See Online Users**: View list of team members currently online
3. **Start a Call**: Click the "📞 Call" button next to a user's name
4. **Accept Call**: The other user will automatically receive the call
5. **During Call**:
   - 🎤 Toggle microphone on/off
   - 📹 Toggle camera on/off
   - 📞 End Call button to disconnect

## Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions must be granted
- HTTPS required for production (browsers block camera access on HTTP)

## Deployment Notes

### Frontend
- Video call connects to same Socket.io server as chat
- Automatically detects production vs development environment
- Production URL: `https://devlog-1.onrender.com`

### Backend
- No additional configuration needed
- Video signaling uses existing Socket.io server
- No video data passes through server (peer-to-peer)

## Network Requirements

- **STUN Server**: Uses Google's public STUN servers
  - `stun:stun.l.google.com:19302`
  - `stun:stun1.l.google.com:19302`

- **For Enterprise/Firewall**: May need TURN server for restricted networks
  - TURN servers relay video when peer-to-peer fails
  - Can use services like Twilio, Xirsys, or self-hosted Coturn

## Troubleshooting

**Camera/Mic Not Working:**
- Check browser permissions for camera/microphone
- Ensure HTTPS in production
- Try refreshing the page

**Call Not Connecting:**
- Check if both users are online
- Verify firewall allows WebRTC traffic
- Check browser console for errors

**Poor Video Quality:**
- Check network bandwidth
- Try disabling video (audio-only)
- Consider adding quality controls

## Future Enhancements

- [ ] Screen sharing
- [ ] Recording calls
- [ ] Group video calls (more than 2 participants)
- [ ] Call history
- [ ] Chat during video calls
- [ ] Virtual backgrounds
- [ ] Network quality indicators
