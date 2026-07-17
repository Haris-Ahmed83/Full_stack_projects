document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const localVideo = document.getElementById('localVideo');
    const remoteVideosContainer = document.getElementById('remoteVideos');
    const startCallBtn = document.getElementById('startCallBtn');
    const hangUpBtn = document.getElementById('hangUpBtn');
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    const toggleVideoBtn = document.getElementById('toggleVideoBtn');
    const statusMessage = document.getElementById('status');

    // WebRTC related variables
    let localStream; // Stores the user's local media stream (video and audio)
    let peerConnection; // The RTCPeerConnection object for the call
    const remoteVideoElements = new Map(); // Map to store remote video elements, keyed by remote track ID
    // STUN server for NAT traversal. Essential for WebRTC to find public IP addresses.
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }; 

    // --- Simulated Signaling Channel (BroadcastChannel for same-browser tab communication) ---
    // IMPORTANT: In a real multi-user video chat application, this BroadcastChannel 
    // would be replaced by a dedicated signaling server (e.g., using WebSockets like Socket.io).
    // The server would relay WebRTC offer, answer, and ICE candidate messages between peers.
    // BroadcastChannel allows this demo to be fully functional locally between two tabs.
    const channel = new BroadcastChannel('webrtc-video-chat-room'); // Unique channel name for this app
    const myId = Math.random().toString(36).substring(2, 9); // Generate a unique ID for this browser tab

    // --- UI Update Functions ---
    const updateStatus = (message) => {
        statusMessage.textContent = message;
    };

    const setCallButtonsState = (calling) => {
        startCallBtn.disabled = calling;
        hangUpBtn.disabled = !calling;
        toggleAudioBtn.disabled = !calling;
        toggleVideoBtn.disabled = !calling;
    };

    // --- Signaling via BroadcastChannel ---
    channel.onmessage = async (event) => {
        const signal = event.data;
        // Ignore messages sent by this tab itself
        if (signal.senderId === myId) return;

        updateStatus(`Received signal from ${signal.senderId}: ${signal.type}`);

        switch (signal.type) {
            case 'offer':
                // If an offer is received and no peer connection exists, create one.
                if (!peerConnection) await createPeerConnection();
                // Set the received offer as the remote description
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
                // Create an answer to the offer
                const answer = await peerConnection.createAnswer();
                // Set the answer as the local description
                await peerConnection.setLocalDescription(answer);
                // Send the answer back to the initiating peer
                sendSignal({ type: 'answer', payload: answer });
                break;
            case 'answer':
                // Set the received answer as the remote description
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
                break;
            case 'candidate':
                // Add received ICE candidates to the peer connection
                if (signal.payload) {
                    try {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload));
                    } catch (e) {
                        console.error('Error adding received ICE candidate:', e);
                    }
                }
                break;
            case 'hangup':
                // Handle hangup initiated by the remote peer
                handleRemoteHangUp();
                break;
            default:
                console.warn('Unknown signal type:', signal.type);
        }
    };

    const sendSignal = (data) => {
        // Augment the signal message with the sender's unique ID
        channel.postMessage({ ...data, senderId: myId });
    };

    // --- WebRTC Functions ---

    // 1. Get local media stream (camera and microphone)
    const startLocalStream = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localVideo.srcObject = localStream; // Display local stream in the video element
            updateStatus('Local stream started. Ready to call.');
            setCallButtonsState(false); // Enable 'Start Call' button once stream is ready
            startCallBtn.disabled = false;
        } catch (error) {
            console.error('Error getting local stream:', error);
            updateStatus(`Error: ${error.message}. Please allow camera/microphone access.`);
            // Keep start call button disabled if stream fails
            startCallBtn.disabled = true;
        }
    };

    // 2. Create RTCPeerConnection and set up event handlers
    const createPeerConnection = async () => {
        peerConnection = new RTCPeerConnection(configuration);

        // Add all local tracks (audio and video) to the peer connection
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Event: Fired when an ICE candidate is generated by the local peer
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Send the ICE candidate to the remote peer via the signaling channel
                sendSignal({ type: 'candidate', payload: event.candidate });
            }
        };

        // Event: Fired when a remote track (audio/video) is received
        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0]; // The remote media stream
            const trackId = event.track.id; // Unique ID for the remote track
            
            // Check if a video element for this track already exists to avoid duplicates
            if (!remoteVideoElements.has(trackId)) {
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'remote-video-item';
                videoWrapper.id = `remote-video-${trackId}`;

                const videoElement = document.createElement('video');
                videoElement.autoplay = true;
                videoElement.playsinline = true; // Important for iOS to play video inline
                videoElement.srcObject = remoteStream;
                
                // Attempt to play video once metadata is loaded
                videoElement.onloadedmetadata = () => {
                    videoElement.play().catch(e => console.error("Error playing remote video:", e));
                };

                videoWrapper.appendChild(videoElement);
                remoteVideosContainer.appendChild(videoWrapper);
                remoteVideoElements.set(trackId, videoWrapper); // Store reference for cleanup
                updateStatus('Remote stream added.');
            }
        };

        // Event: Peer connection state changes (e.g., 'new', 'connecting', 'connected', 'disconnected', 'failed', 'closed')
        peerConnection.onconnectionstatechange = () => {
            updateStatus(`Peer connection state: ${peerConnection.connectionState}`);
            if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
                console.log('Peer connection disconnected or failed.');
                cleanUpPeerConnection();
            } else if (peerConnection.connectionState === 'closed') {
                cleanUpPeerConnection();
            }
        };

        // Event: ICE connection state changes (e.g., 'new', 'checking', 'connected', 'completed', 'disconnected', 'failed', 'closed')
        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                updateStatus('ICE connection failed or disconnected.');
                // In a real app, you might try to restart ICE here.
            } else if (peerConnection.iceConnectionState === 'closed') {
                // Clean up if ICE connection is closed
                cleanUpPeerConnection();
            }
        };

        return peerConnection;
    };

    // 3. Initiate the call (create offer and send it)
    const callUser = async () => {
        updateStatus('Creating offer...');
        setCallButtonsState(true);
        await createPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendSignal({ type: 'offer', payload: offer });
    };

    // 4. Hang up the call (local action)
    const hangUp = () => {
        updateStatus('Hanging up...');
        sendSignal({ type: 'hangup', payload: null }); // Inform the remote peer
        cleanUpPeerConnection();
        setCallButtonsState(false);
        startCallBtn.disabled = false;
    };

    // 5. Handle remote hang up (triggered by signal from remote peer)
    const handleRemoteHangUp = () => {
        updateStatus('Remote peer hung up.');
        cleanUpPeerConnection();
        setCallButtonsState(false);
        startCallBtn.disabled = false;
    };

    // Clean up RTCPeerConnection and remove all remote video elements
    const cleanUpPeerConnection = () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        // Remove all dynamically added remote video elements from the DOM
        remoteVideoElements.forEach(videoWrapper => videoWrapper.remove());
        remoteVideoElements.clear(); // Clear the map
        updateStatus('Call ended. Ready for new call.');
    };

    // --- Media Controls ---
    const toggleAudio = () => {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            // Update button UI based on track state
            toggleAudioBtn.classList.toggle('off', !track.enabled);
            toggleAudioBtn.classList.toggle('active', track.enabled);
            toggleAudioBtn.innerHTML = track.enabled ? '<i class="fas fa-microphone"></i>' : '<i class="fas fa-microphone-slash"></i>';
            updateStatus(`Audio ${track.enabled ? 'on' : 'off'}`);
        });
    };

    const toggleVideo = () => {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            // Update button UI based on track state
            toggleVideoBtn.classList.toggle('off', !track.enabled);
            toggleVideoBtn.classList.toggle('active', track.enabled);
            toggleVideoBtn.innerHTML = track.enabled ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video-slash"></i>';
            updateStatus(`Video ${track.enabled ? 'on' : 'off'}`);
        });
    };

    // --- Event Listeners ---
    startCallBtn.addEventListener('click', callUser);
    hangUpBtn.addEventListener('click', hangUp);
    toggleAudioBtn.addEventListener('click', toggleAudio);
    toggleVideoBtn.addEventListener('click', toggleVideo);

    // Initialize the app by getting local media stream
    startLocalStream();
    // Set initial button states. Start Call enabled, Hang Up disabled.
    setCallButtonsState(false); 
    // Set initial visual state for toggle buttons (assuming audio/video are on by default)
    toggleAudioBtn.classList.add('active'); 
    toggleVideoBtn.classList.add('active');
});
