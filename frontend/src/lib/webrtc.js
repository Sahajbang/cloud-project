let localStream = null;
let remoteStream = null;

/**
 * Requests camera and microphone access and stores the stream.
 */
export const getMediaStream = async () => {
  try {
    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    }
    return localStream;
  } catch (error) {
    console.error("Failed to get media stream", error);
    throw error;
  }
};

/**
 * Creates a new RTCPeerConnection without automatically adding tracks.
 */
export const createPeerConnection = ({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
} = {}) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Setup ICE candidate handler
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }

    // Avoid duplicate tracks
    const trackAlreadyExists = remoteStream
      .getTracks()
      .some((t) => t.id === event.track.id);
    if (!trackAlreadyExists) {
      remoteStream.addTrack(event.track);
    }

    if (onTrack) {
      onTrack(remoteStream);
    }
  };

  // Connection state updates
  peerConnection.onconnectionstatechange = () => {
    if (onConnectionStateChange) {
      onConnectionStateChange(peerConnection.connectionState);
    }
  };

  return peerConnection;
};

/**
 * Gracefully closes a peer connection and stops media streams.
 */
export const closePeerConnection = (pc) => {
  if (pc) {
    try {
      pc.getSenders().forEach((sender) => sender.track?.stop());
      pc.close();
    } catch (e) {
      console.warn("Error closing peer connection:", e);
    }
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
    remoteStream = null;
  }
};

// Accessors
export const getLocalStream = () => localStream;
export const getRemoteStream = () => remoteStream;

// let localStream = null;
// let remoteStream = null;

// export const getMediaStream = async () => {
//   try {
//     localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     return localStream;
//   } catch (error) {
//     console.error("Failed to get media stream", error);
//     throw error;
//   }
// };

// export const createPeerConnection = ({
//   onIceCandidate,
//   onTrack,
//   onConnectionStateChange,
// } = {}) => {
//   const peerConnection = new RTCPeerConnection({
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//     ],
//   });

//   // Add local tracks to the connection
//   if (localStream) {
//     localStream.getTracks().forEach(track => {
//       peerConnection.addTrack(track, localStream);
//     });
//   }

//   // Handle new ICE candidates
//   peerConnection.onicecandidate = event => {
//     if (event.candidate && onIceCandidate) {
//       onIceCandidate(event.candidate);
//     }
//   };

//   // Handle incoming tracks from remote peer
//   peerConnection.ontrack = event => {
//     if (!remoteStream) {
//       remoteStream = new MediaStream();
//     }

//     remoteStream.addTrack(event.track);
//     if (onTrack) {
//       onTrack(remoteStream);
//     }
//   };

//   peerConnection.onconnectionstatechange = () => {
//     if (onConnectionStateChange) {
//       onConnectionStateChange(peerConnection.connectionState);
//     }
//   };

//   return peerConnection;
// };

// // Optional cleanup method
// export const closePeerConnection = (pc) => {
//   if (pc) {
//     pc.getSenders().forEach(sender => pc.removeTrack(sender));
//     pc.close();
//   }
//   if (localStream) {
//     localStream.getTracks().forEach(track => track.stop());
//     localStream = null;
//   }
//   if (remoteStream) {
//     remoteStream.getTracks().forEach(track => track.stop());
//     remoteStream = null;
//   }
// };

// // Accessors for local/remote streams if needed elsewhere
// export const getLocalStream = () => localStream;
// export const getRemoteStream = () => remoteStream;




// let peerConnection = null;
// let localStream = null;
// let remoteStream = null;

// const configuration = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
//   ],
// };

// // Get local media stream (camera + mic)
// export const getLocalStream = async () => {
//   if (!localStream) {
//     localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   }
//   return localStream;
// };

// // Initialize and configure peer connection
// export const createPeerConnection = ({ onTrack, onIceCandidate, onConnectionStateChange } = {}) => {
//   peerConnection = new RTCPeerConnection(configuration);

//   // Handle incoming media
//   peerConnection.ontrack = (event) => {
//     if (!remoteStream) {
//       remoteStream = new MediaStream();
//     }
//     event.streams[0].getTracks().forEach(track => {
//       remoteStream.addTrack(track);
//     });
//     if (onTrack) onTrack(remoteStream);
//   };

//   // Handle ICE candidates
//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate && onIceCandidate) {
//       onIceCandidate(event.candidate);
//     }
//   };

//   // Connection state change (optional hook)
//   peerConnection.onconnectionstatechange = () => {
//     if (onConnectionStateChange) {
//       onConnectionStateChange(peerConnection.connectionState);
//     }
//   };

//   return peerConnection;
// };

// // Add local tracks to the peer connection
// export const addLocalTracks = async () => {
//   if (!peerConnection) throw new Error("PeerConnection is not created");
//   if (!localStream) throw new Error("Local stream not available");

//   localStream.getTracks().forEach(track => {
//     peerConnection.addTrack(track, localStream);
//   });
// };

// // Create and return SDP offer
// export const createOffer = async () => {
//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   return offer;
// };

// // Handle incoming SDP offer, create and return answer
// export const createAnswer = async (offer) => {
//   await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//   const answer = await peerConnection.createAnswer();
//   await peerConnection.setLocalDescription(answer);
//   return answer;
// };

// // Handle incoming SDP answer
// export const handleAnswer = async (answer) => {
//   await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
// };

// // Add ICE candidate
// export const addIceCandidate = async (candidate) => {
//   if (candidate) {
//     await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//   }
// };

// // Close everything
// export const closeConnection = () => {
//   if (peerConnection) {
//     peerConnection.close();
//     peerConnection = null;
//   }
//   if (localStream) {
//     localStream.getTracks().forEach(track => track.stop());
//     localStream = null;
//   }
//   if (remoteStream) {
//     remoteStream.getTracks().forEach(track => track.stop());
//     remoteStream = null;
//   }
// };

// // Accessors
// export const getRemoteStream = () => remoteStream;
// export const getCurrentLocalStream = () => localStream;

