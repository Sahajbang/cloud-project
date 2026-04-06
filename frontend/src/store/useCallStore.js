import { create } from 'zustand';
import { getSocket } from '../socket';

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const useCallStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isCalling: false,
  isReceivingCall: false,
  callAccepted: false,
  callRejected: false,
  callerInfo: null,
  isVideoPanelVisible: false,

  // Add missing setters
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (pc) => set({ peerConnection: pc }),

  initCallSocketListeners: () => {
    const socket = getSocket();
    if (!socket) {
      console.warn('[CallStore] Socket not initialized');
      return;
    }

    console.log('[CallStore] Initializing call socket listeners');

    socket.on('call:incoming', ({ from }) => {
      console.log('[Socket] Incoming call from:', from);
      set({ isReceivingCall: true, callerInfo: from });
    });

    socket.on('call:accepted', () => {
      console.log('[Socket] Call accepted by callee');
      set({ callAccepted: true, isVideoPanelVisible: true });
    });

    socket.on('call:rejected', () => {
      console.log('[Socket] Call rejected by callee');
      set({ callRejected: true, isReceivingCall: false });
    });

    socket.on('call:offer', async ({ offer }) => {
      console.log('[Socket] Received offer:', offer);
      const peerConnection = new RTCPeerConnection(configuration);
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = event => {
        console.log('[Peer] ontrack event:', event.streams);
        const [remoteStream] = event.streams;
        set({ remoteStream });
      };

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log('[Peer] Sending ICE candidate');
          socket.emit('call:ice-candidate', { candidate: event.candidate });
        }
      };

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('call:answer', { answer });

      set({
        peerConnection,
        localStream,
        callAccepted: true,
        isVideoPanelVisible: true,
      });
    });

    socket.on('call:answer', async ({ answer }) => {
      console.log('[Socket] Received answer:', answer);
      const { peerConnection } = get();
      if (peerConnection) {
        try {
          // Ensure the answer is a valid RTCSessionDescription
          const description = new RTCSessionDescription(answer);
          await peerConnection.setRemoteDescription(description);
          console.log('[Socket] Remote description set successfully');
        } catch (error) {
          console.error('[Peer] Failed to set remote description', error);
        }
      }
    });

    socket.on('call:ice-candidate', async ({ candidate }) => {
      const { peerConnection } = get();
      if (peerConnection && candidate) {
        try {
          console.log('[Socket] Adding ICE candidate');
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[Peer] Error adding ICE candidate', err);
        }
      }
    });
  },

  startCall: async (userId) => {
    console.log('[CallStore] Starting call to:', userId);
    const socket = getSocket();
    if (!socket) return;

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        console.log('[Peer] Sending ICE candidate to callee');
        socket.emit('call:ice-candidate', { to: userId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = event => {
      console.log('[Peer] ontrack received on caller side');
      const [remoteStream] = event.streams;
      set({ remoteStream });
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('call:offer', { to: userId, offer });
    socket.emit('call:incoming', { to: userId, from: socket.id });

    set({
      localStream,
      peerConnection,
      isCalling: true,
      isVideoPanelVisible: true,
    });
  },

  acceptCall: async () => {
    console.log('[CallStore] Accepting call...');
    const socket = getSocket();
    const { callerInfo } = get();
    if (!socket || !callerInfo?._id) return;

    socket.emit('call-accepted', { to: callerInfo._id }); // Fix socket event name to 'call-accepted'

    set({
      callAccepted: true,
      isReceivingCall: false,
      isVideoPanelVisible: true,
    });
  },

  rejectCall: () => {
    console.log('[CallStore] Rejecting call...');
    const socket = getSocket();
    const { callerInfo } = get();
    if (!socket || !callerInfo?._id) return;

    socket.emit('call-rejected', { to: callerInfo._id }); // Fix socket event name to 'call-rejected'

    set({
      callRejected: true,
      isReceivingCall: false,
      callerInfo: null,
      isVideoPanelVisible: false,
    });
  },

  endCall: () => {
    console.log('[CallStore] Ending call...');
    const { peerConnection, localStream } = get();

    if (peerConnection) {
      peerConnection.close();
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    set({
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isCalling: false,
      isReceivingCall: false,
      callAccepted: false,
      callRejected: false,
      callerInfo: null,
      isVideoPanelVisible: false,
    });
  },
}));

export default useCallStore;

// import { create } from 'zustand';
// import { getSocket } from '../socket';

// const configuration = {
//   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
// };

// const useCallStore = create((set, get) => ({
//   localStream: null,
//   remoteStream: null,
//   peerConnection: null,
//   isCalling: false,
//   isReceivingCall: false,
//   callAccepted: false,
//   callRejected: false,
//   callerInfo: null,
//   isVideoPanelVisible: false, // ✅ added

//   initCallSocketListeners: () => {
//     const socket = getSocket();
//     if (!socket) {
//       console.warn('[CallStore] Socket not initialized');
//       return;
//     }

//     console.log('[CallStore] Initializing call socket listeners');

//     socket.on('call:incoming', ({ from }) => {
//       console.log('[Socket] Incoming call from:', from);
//       set({ isReceivingCall: true, callerInfo: from });
//     });

//     socket.on('call:accepted', () => {
//       console.log('[Socket] Call accepted by callee');
//       set({ callAccepted: true, isVideoPanelVisible: true });
//     });

//     socket.on('call:rejected', () => {
//       console.log('[Socket] Call rejected by callee');
//       set({ callRejected: true, isReceivingCall: false });
//     });

//     socket.on('call:offer', async ({ offer }) => {
//       console.log('[Socket] Received offer:', offer);
//       const peerConnection = new RTCPeerConnection(configuration);
//       const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//       localStream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, localStream);
//       });

//       peerConnection.ontrack = event => {
//         console.log('[Peer] ontrack event:', event.streams);
//         const [remoteStream] = event.streams;
//         set({ remoteStream });
//       };

//       peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//           console.log('[Peer] Sending ICE candidate');
//           socket.emit('call:ice-candidate', { candidate: event.candidate });
//         }
//       };

//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       socket.emit('call:answer', { answer });

//       set({
//         peerConnection,
//         localStream,
//         callAccepted: true,
//         isVideoPanelVisible: true,
//       });
//     });

//     socket.on('call:answer', async ({ answer }) => {
//       console.log('[Socket] Received answer');
//       const { peerConnection } = get();
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     socket.on('call:ice-candidate', async ({ candidate }) => {
//       const { peerConnection } = get();
//       if (peerConnection && candidate) {
//         try {
//           console.log('[Socket] Adding ICE candidate');
//           await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//           console.error('[Peer] Error adding ICE candidate', err);
//         }
//       }
//     });
//   },

//   startCall: async (userId) => {
//     console.log('[CallStore] Starting call to:', userId);
//     const socket = getSocket();
//     if (!socket) return;

//     const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     const peerConnection = new RTCPeerConnection(configuration);

//     localStream.getTracks().forEach(track => {
//       peerConnection.addTrack(track, localStream);
//     });

//     peerConnection.onicecandidate = event => {
//       if (event.candidate) {
//         console.log('[Peer] Sending ICE candidate to callee');
//         socket.emit('call:ice-candidate', { to: userId, candidate: event.candidate });
//       }
//     };

//     peerConnection.ontrack = event => {
//       console.log('[Peer] ontrack received on caller side');
//       const [remoteStream] = event.streams;
//       set({ remoteStream });
//     };

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     socket.emit('call:offer', { to: userId, offer });
//     socket.emit('call:incoming', { to: userId, from: socket.id });

//     set({
//       localStream,
//       peerConnection,
//       isCalling: true,
//       isVideoPanelVisible: true,
//     });
//   },

//   acceptCall: async () => {
//     console.log('[CallStore] Accepting call...');
//     const socket = getSocket();
//     const { callerInfo } = get();
//     if (!socket || !callerInfo?._id) return;

//     socket.emit('call:accept', { to: callerInfo._id });

//     set({
//       callAccepted: true,
//       isReceivingCall: false,
//       isVideoPanelVisible: true,
//     });
//   },

//   rejectCall: () => {
//     console.log('[CallStore] Rejecting call...');
//     const socket = getSocket();
//     const { callerInfo } = get();
//     if (!socket || !callerInfo?._id) return;

//     socket.emit('call:reject', { to: callerInfo._id });

//     set({
//       callRejected: true,
//       isReceivingCall: false,
//       callerInfo: null,
//       isVideoPanelVisible: false,
//     });
//   },

//   endCall: () => {
//     console.log('[CallStore] Ending call...');
//     const { peerConnection, localStream } = get();

//     if (peerConnection) {
//       peerConnection.close();
//     }

//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//     }

//     set({
//       localStream: null,
//       remoteStream: null,
//       peerConnection: null,
//       isCalling: false,
//       isReceivingCall: false,
//       callAccepted: false,
//       callRejected: false,
//       callerInfo: null,
//       isVideoPanelVisible: false,
//     });
//   },
// }));

// export default useCallStore;


// import { create } from 'zustand';
// import { getSocket } from '../socket';

// const configuration = {
//   iceServers: [
//     {
//       urls: 'stun:stun.l.google.com:19302',
//     },
//   ],
// };

// const useCallStore = create((set, get) => ({
//   localStream: null,
//   remoteStream: null,
//   peerConnection: null,
//   isCalling: false,
//   isReceivingCall: false,
//   callAccepted: false,
//   callRejected: false,
//   callerInfo: null,

//   // Initialize all socket listeners
//   initCallSocketListeners: () => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.on('call:incoming', ({ from }) => {
//       set({ isReceivingCall: true, callerInfo: from });
//     });

//     socket.on('call:accepted', () => {
//       set({ callAccepted: true });
//     });

//     socket.on('call:rejected', () => {
//       set({ callRejected: true, isReceivingCall: false });
//     });

//     socket.on('call:offer', async ({ offer }) => {
//       const peerConnection = new RTCPeerConnection(configuration);
//       const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//       localStream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, localStream);
//       });

//       peerConnection.ontrack = event => {
//         const [remoteStream] = event.streams;
//         set({ remoteStream });
//       };

//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       const socket = getSocket();
//       socket.emit('call:answer', { answer });

//       set({ peerConnection, localStream, callAccepted: true });
//     });

//     socket.on('call:answer', async ({ answer }) => {
//       const { peerConnection } = get();
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     socket.on('call:ice-candidate', async ({ candidate }) => {
//       const { peerConnection } = get();
//       if (peerConnection && candidate) {
//         try {
//           await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//           console.error('Error adding received ice candidate', err);
//         }
//       }
//     });
//   },

//   startCall: async (userId) => {
//     const socket = getSocket();
//     if (!socket) return;

//     const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     const peerConnection = new RTCPeerConnection(configuration);

//     localStream.getTracks().forEach(track => {
//       peerConnection.addTrack(track, localStream);
//     });

//     peerConnection.onicecandidate = event => {
//       if (event.candidate) {
//         socket.emit('call:ice-candidate', { to: userId, candidate: event.candidate });
//       }
//     };

//     peerConnection.ontrack = event => {
//       const [remoteStream] = event.streams;
//       set({ remoteStream });
//     };

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     socket.emit('call:offer', { to: userId, offer });
//     socket.emit('call:incoming', { to: userId, from: socket.id });

//     set({ localStream, peerConnection, isCalling: true });
//   },

//   acceptCall: async () => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.emit('call:accept', { to: get().callerInfo._id }); // or callerInfo.id
//     set({ callAccepted: true, isReceivingCall: false });
//   },

//   rejectCall: () => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.emit('call:reject', { to: get().callerInfo._id });
//     set({ callRejected: true, isReceivingCall: false, callerInfo: null });
//   },

//   endCall: () => {
//     const { peerConnection, localStream } = get();

//     if (peerConnection) {
//       peerConnection.close();
//     }

//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//     }

//     set({
//       localStream: null,
//       remoteStream: null,
//       peerConnection: null,
//       isCalling: false,
//       isReceivingCall: false,
//       callAccepted: false,
//       callRejected: false,
//       callerInfo: null,
//     });
//   },
// }));

// export default useCallStore;


// import { create } from "zustand";
// import { io } from "socket.io-client";
// import { useAuthStore } from "./useAuthStore";
// import { HelpCircleIcon } from "lucide-react";

// let socket;

// export const useCallStore = create((set, get) => {
//   const { authUser } = useAuthStore.getState();

//   if (!socket) {
//     socket = io("http://localhost:5173", {
//       query: {
//         userId: authUser?._id,
//       },
//     });
//   }

//   let iceCandidateQueue = [];

//   return {
//     localStream: null,
//     remoteStream: null,
//     peerConnection: null,
//     isReceivingCall: false,
//     incomingCaller: null,
//     incomingOffer: null,
//     isVideoPanelVisible: false,

//     setLocalStream: (stream) => {
//       console.log("📹 Local stream set.");
//       set({ localStream: stream });
//     },

//     setPeerConnection: (pc) => {
//       console.log("🧩 Peer connection set.");
//       set({ peerConnection: pc });
//     },

//     setVideoCallPanelOpen: (isOpen) => {
//       console.log(`🪟 Video panel visibility: ${isOpen}`);
//       set({ isVideoPanelVisible: isOpen });
//     },

//     sendIceCandidate: ({ to, candidate }) => {
//       const { authUser } = useAuthStore.getState();
//       socket.emit("ice-candidate", {
//         to,
//         candidate,
//         from: authUser._id,
//       });
//       console.log("✅ ICE Candidate emitted via socket");
//     },

//     handleIceCandidate: (candidate) => {
//       const { peerConnection } = get();
//       if (peerConnection && peerConnection.remoteDescription) {
//         peerConnection.addIceCandidate(candidate).catch((error) => {
//           console.error("❌ Failed to add ICE candidate", error);
//         });
//       } else {
//         iceCandidateQueue.push(candidate);
//         console.log("📦 ICE Candidate queued");
//       }
//     },

//     callUser: async ({ to }) => {
//       console.log("📞 Initiating call to:", to);

//       // Step 1: Always get a fresh media stream
//       let stream;
//       try {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         console.log("📹 Fresh local stream obtained:", stream);
//       } catch (err) {
//         console.error("❌ Failed to get local media stream:", err);
//         return;
//       }

//       if (!stream || !stream.active) {
//         console.error("❌ Local stream is inactive");
//         return;
//       }

//       // Step 2: Store stream in Zustand
//       set({ localStream: stream });

//       // Step 3: Create and configure PeerConnection
//       const peerConnection = new RTCPeerConnection();

//       stream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, stream);
//       });

//       const offer = await peerConnection.createOffer();
//       await peerConnection.setLocalDescription(offer);

//       socket.emit("call-user", {
//         to,
//         offer,
//         from: authUser?._id,
//       });
//       console.log("📤 Offer sent via socket");

//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", {
//             to,
//             candidate: event.candidate,
//             from: authUser?._id,
//           });
//         }
//       };

//       peerConnection.ontrack = (event) => {
//         console.log("📺 Remote stream received");
//         set({ remoteStream: event.streams[0] });
//       };

//       set({ peerConnection });

//       if (iceCandidateQueue.length > 0) {
//         iceCandidateQueue.forEach((candidate) => {
//           peerConnection.addIceCandidate(candidate).catch((error) => {
//             console.error("❌ Failed to add queued ICE candidate", error);
//           });
//         });
//         iceCandidateQueue = [];
//       }
//     },
//     // callUser: async ({ to }) => {
//     //   const { localStream } = get();
//     //   console.log("📞 Initiating call to:", to);

//     //   const peerConnection = new RTCPeerConnection();

//     //   localStream.getTracks().forEach((track) => {
//     //     peerConnection.addTrack(track, localStream);
//     //   });

//     //   const offer = await peerConnection.createOffer();
//     //   await peerConnection.setLocalDescription(offer);

//     //   socket.emit("call-user", {
//     //     to,
//     //     offer,
//     //     from: authUser?._id,
//     //   });
//     //   console.log("📤 Offer sent via socket");

//     //   peerConnection.onicecandidate = (event) => {
//     //     if (event.candidate) {
//     //       socket.emit("ice-candidate", {
//     //         to,
//     //         candidate: event.candidate,
//     //         from: authUser?._id,
//     //       });
//     //     }
//     //   };

//     //   peerConnection.ontrack = (event) => {
//     //     console.log("📺 Remote stream received");
//     //     set({ remoteStream: event.streams[0] });
//     //   };

//     //   set({ peerConnection });

//     //   if (iceCandidateQueue.length > 0) {
//     //     iceCandidateQueue.forEach((candidate) => {
//     //       peerConnection.addIceCandidate(candidate).catch((error) => {
//     //         console.error("❌ Failed to add queued ICE candidate", error);
//     //       });
//     //     });
//     //     iceCandidateQueue = [];
//     //   }
//     // },

//     answerCall: async (from, offer, localStream) => {
//       console.log("✅ Answering call from:", from);

//       const peerConnection = new RTCPeerConnection();

//       localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//       });

//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       socket.emit("call-accepted", {
//         to: from,
//         answer,
//         from: authUser?._id,
//       });

//       peerConnection.onicecandidate = (e) => {
//         if (e.candidate) {
//           socket.emit("ice-candidate", {
//             to: from,
//             candidate: e.candidate,
//             from: authUser?._id,
//           });
//         }
//       };

//       peerConnection.ontrack = (event) => {
//         console.log("📺 Remote stream received after answering");
//         set({ remoteStream: event.streams[0] });
//       };

//       set({
//         peerConnection,
//         isReceivingCall: false,
//         incomingCaller: null,
//         incomingOffer: null,
//       });
//     },
    
//     endCall: ({ localVideoRef, remoteVideoRef }) => {
//       console.log("🔚 Ending call...");

//       const {
//         peerConnection,
//         localStream,
//         remoteStream,
//         setVideoCallPanelOpen,
//       } = get();

//       if (peerConnection) {
//         peerConnection.close();
//         console.log("🧩 PeerConnection closed.");
//       }

//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           console.log(`Stopping ${track.kind} track (readyState: ${track.readyState})`);
//           track.stop();
//         });
//       }

//       if (remoteStream) {
//         remoteStream.getTracks().forEach((track) => {
//           console.log(`Stopping remote ${track.kind} track`);
//           track.stop();
//         });
//       }

//       // Clear video elements
//       if (localVideoRef?.current) {
//         localVideoRef.current.srcObject = null;
//         console.log("🎥 Local video srcObject cleared.");
//       }

//       if (remoteVideoRef?.current) {
//         remoteVideoRef.current.srcObject = null;
//         console.log("🎥 Remote video srcObject cleared.");
//       }

//       // Extra safety: forcibly stop all media devices
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//         stream.getTracks().forEach((track) => {
//           console.log("Force-stopping extra media track");
//           track.stop();
//         });
//       }).catch(err => console.warn("Couldn't get media for cleanup", err));

//       set({
//         peerConnection: null,
//         localStream: null,
//         remoteStream: null,
//       });

//       setVideoCallPanelOpen(false);
//       console.log("🪟 Video panel closed.");
//     },


//     // endCall: () => {
//     //   console.log("🔚 Ending call...");

//     //   const {
//     //     peerConnection,
//     //     localStream,
//     //     remoteStream,
//     //     setVideoCallPanelOpen,
//     //   } = get();

//     //   if (peerConnection) {
//     //     peerConnection.close();
//     //     console.log("🧩 PeerConnection closed.");
//     //   }

//     //   if (localStream) {
//     //     localStream.getTracks().forEach((track) => track.stop());
//     //     console.log("📴 Local stream tracks stopped.");
//     //   }

//     //   if (remoteStream) {
//     //     remoteStream.getTracks().forEach((track) => track.stop());
//     //     console.log("📴 Remote stream tracks stopped.");
//     //   }

//     //   set({
//     //     peerConnection: null,
//     //     localStream: null,
//     //     remoteStream: null,
//     //   });

//     //   setVideoCallPanelOpen(false); // Hide the panel
//     //   console.log("🪟 Video panel closed.");
//     // },

//     initCallSocketListeners: () => {
//       console.log("🔌 Initializing call socket listeners...");

//       socket.on("incoming:call", ({ from, offer }) => {
//         console.log("📞 Incoming call from:", from);
//         set({
//           isReceivingCall: true,
//           incomingCaller: from,
//           incomingOffer: offer,
//         });
//       });

//       socket.on("call:accepted", async ({ answer }) => {
//         console.log("✅ Call accepted. Setting remote description.");
//         const { peerConnection } = get();
//         if (peerConnection) {
//           await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on("incoming:call:ice-candidate", async ({ candidate }) => {
//         console.log("📶 Incoming ICE candidate");
//         const { peerConnection } = get();
//         if (peerConnection && candidate) {
//           try {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//           } catch (error) {
//             console.error("❌ Error adding ICE candidate", error);
//           }
//         }
//       });
//     },
//   };
// });


// ==================== Without EndCall function ===================
// import { create } from "zustand";
// import { io } from "socket.io-client";
// import { useAuthStore } from "./useAuthStore"; // Assuming you have an auth store to manage user

// let socket;

// export const useCallStore = create((set, get) => {
//   const { authUser } = useAuthStore.getState(); // Get current user info

//   if (!socket) {
//     socket = io("http://localhost:5173", {
//       query: {
//         userId: authUser?._id,
//       },
//     });
//   }

//   // Queue for ICE candidates before remote description is set
//   let iceCandidateQueue = [];

//   return {
//     localStream: null,
//     remoteStream: null,
//     peerConnection: null,
//     isReceivingCall: false,
//     incomingCaller: null,
//     callOffer: null,
//     isVideoPanelVisible: false, // Video panel visibility state

//     setLocalStream: (stream) => set({ localStream: stream }),
//     setPeerConnection: (pc) => set({ peerConnection: pc }),
//     setVideoCallPanelOpen: (isOpen) => set({ isVideoPanelVisible: isOpen }),
//     sendIceCandidate: ({ to, candidate }) => {
//       const { authUser } = useAuthStore.getState();
//       socket.emit("ice-candidate", {
//         to,
//         candidate,
//         from: authUser._id,
//       });
//       console.log("✅ ICE Candidate emitted via socket");
//     },

//     // Function to handle incoming ICE candidates
//     handleIceCandidate: (candidate) => {
//       const { peerConnection } = get();
//       if (peerConnection && peerConnection.remoteDescription) {
//         peerConnection.addIceCandidate(candidate).catch((error) => {
//           console.error("Failed to add ICE candidate", error);
//         });
//       } else {
//         iceCandidateQueue.push(candidate); // Queue until remote description is set
//       }
//     },

//     // Function to start a video call
//     callUser: async ({ to }) => {
//       const { localStream } = get();

//       const peerConnection = new RTCPeerConnection();

//       // Add local stream tracks to the peer connection
//       localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//       });

//       // ✅ Create offer inside this function
//       const offer = await peerConnection.createOffer();

//       // ✅ Set the offer as local description
//       await peerConnection.setLocalDescription(offer);

//       // ✅ Now send it to the other user
//       socket.emit("call-user", {
//         to,
//         offer,
//         from: authUser?._id,
//       });

//       // Handle ICE candidates
//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", {
//             to,
//             candidate: event.candidate,
//             from: authUser?._id,
//           });
//         }
//       };

//       // Handle remote stream
//       peerConnection.ontrack = (event) => {
//         set({ remoteStream: event.streams[0] });
//       };

//       set({ peerConnection });

//       // Process any queued ICE candidates
//       if (iceCandidateQueue.length > 0) {
//         iceCandidateQueue.forEach((candidate) => {
//           peerConnection.addIceCandidate(candidate).catch((error) => {
//             console.error("Failed to add queued ICE candidate", error);
//           });
//         });
//         iceCandidateQueue = []; // Clear the queue
//       }
//     },

//     // Function to answer an incoming call
//     answerCall: async (from, offer, localStream) => {
//       const peerConnection = new RTCPeerConnection();

//       localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//       });

//       // Set the remote description (offer)
//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

//       // Create and send the answer back
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       socket.emit("call-accepted", {
//         to: from,
//         answer,
//         from: authUser?._id,
//       });

//       // Handle ICE candidates
//       peerConnection.onicecandidate = (e) => {
//         if (e.candidate) {
//           socket.emit("ice-candidate", {
//             to: from,
//             candidate: e.candidate,
//             from: authUser?._id,
//           });
//         }
//       };

//       // Handle remote stream
//       peerConnection.ontrack = (event) => {
//         set({ remoteStream: event.streams[0] });
//       };

//       set({ peerConnection, isReceivingCall: false, incomingCaller: null });
//     },

//     // Initialize socket event listeners
//     initCallSocketListeners: () => {
//       socket.on("incoming:call", ({ from, offer }) => {
//         console.log("📞 Incoming call from:", from);
//         console.log("Offer received:", offer);

//         set(() => ({
//           isReceivingCall: true,
//           incomingCaller: from,
//           incomingOffer: offer,
//         }));
//       });

//       socket.on("call:accepted", async ({ answer }) => {
//         const { peerConnection } = get();
//         if (peerConnection) {
//           await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on("incoming:call:ice-candidate", async ({ candidate }) => {
//         const { peerConnection } = get();
//         if (peerConnection && candidate) {
//           try {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//           } catch (error) {
//             console.error("Error adding ICE candidate", error);
//           }
//         }
//       });
//     },
//   };
// });



// import { create } from "zustand";

// // Use this to manage the video call state, including peer connection and signaling.
// export const useCallStore = create((set, get) => ({
//   // State variables related to the call
//   isReceivingCall: false,   // Whether a call is incoming
//   isInCall: false,          // Whether the user is currently in a call
//   localStream: null,        // Local video stream
//   remoteStream: null,       // Remote video stream
//   incomingCaller: null,     // Caller information (if incoming call)
//   peerConnection: null,     // WebRTC peer connection
//   iceCandidates: [],        // ICE candidates for peer connection
//   videoCallPanelOpen: false, // Whether the video call panel is open
//   socket: null,             // Socket.io instance for signaling
  
//   // Initialize the socket (you may want to set it in your main component)
//   setSocket: (socket) => set({ socket }),

//   // Action to set the video call panel open or closed
//   setVideoCallPanelOpen: (isOpen) => set({ videoCallPanelOpen: isOpen }),

//   // Action to set the peer connection object
//   setPeerConnection: (peerConnection) => set({ peerConnection }),

//   // Actions to handle the call
//   acceptCall: () => set((state) => {
//     const { peerConnection, localStream } = state;

//     if (!peerConnection || !localStream) return;

//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         state.sendIceCandidate(event.candidate);
//       }
//     };

//     // Handle accepting the call and setting the state
//     set({ isReceivingCall: false, isInCall: true });
//   }),

//   endCall: () => {
//     const { peerConnection, localStream, remoteStream } = get();
//     if (peerConnection) {
//       peerConnection.close();
//     }
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//     }
//     if (remoteStream) {
//       remoteStream.getTracks().forEach(track => track.stop());
//     }
//     set({ isInCall: false, peerConnection: null, remoteStream: null, localStream: null });
//   },

//   // Method to handle sending ICE candidates to the other peer
//   sendIceCandidate: (candidate) => {
//     const { socket } = get();
//     if (!socket) return;

//     // Send the ICE candidate to the other peer via the signaling server
//     socket.emit('send-candidate', candidate);
//     console.log("Sending ICE Candidate: ", candidate);
//   },

//   // Set the local stream (this is where you would set the user's video/audio stream)
//   setLocalStream: (stream) => set({ localStream: stream }),

//   // Set the remote stream (when the remote peer sends their stream)
//   setRemoteStream: (stream) => set({ remoteStream: stream }),

//   // Create and manage the WebRTC peer connection
//   createPeerConnection: () => set((state) => {
//     const peerConnection = new RTCPeerConnection();

//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         state.sendIceCandidate(event.candidate);
//       }
//     };

//     // Handle remote stream when it is received
//     peerConnection.ontrack = (event) => {
//       // When a remote stream is added, set it in the state
//       state.setRemoteStream(event.streams[0]);
//     };

//     // Add ICE candidate handling here if needed

//     set({ peerConnection });
//     return peerConnection;
//   }),

//   // To handle adding ICE candidates that come from the other peer
//   addIceCandidate: (candidate) => {
//     const { peerConnection } = get();
//     if (peerConnection) {
//       peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     }
//   },

//   // Action to call a user (initiate a video call)
//   callUser: ({ to, offer }) => {
//     const { socket } = get();
//     if (!socket) return;

//     // Send the offer to the other user via signaling
//     socket.emit('call-user', { to, offer });
//     console.log(`Calling user ${to} with offer: `, offer);
//   },

//   // Action to send the offer
//   sendOffer: async (peerConnection) => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     // Send the offer to the other peer via signaling
//     const { socket } = get();
//     if (!socket) return;

//     socket.emit('send-offer', offer);
//     console.log("Sending Offer: ", offer);
//     return offer;
//   },

//   // Action to set the remote description from the offer received
//   setRemoteDescription: async (offer) => {
//     const { peerConnection } = get();
//     if (!peerConnection) return;

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//   },

//   // Action to create an answer to an incoming call
//   createAnswer: async (peerConnection) => {
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);

//     // Send the answer to the other peer via signaling
//     const { socket } = get();
//     if (!socket) return;

//     socket.emit('send-answer', answer);
//     console.log("Sending Answer: ", answer);
//     return answer;
//   },

//   // Handle incoming call logic (set isReceivingCall)
//   incomingCall: (caller) => set({ isReceivingCall: true, incomingCaller: caller }),

//   // Action to handle the incoming offer
//   handleOffer: async (offer) => {
//     const { peerConnection } = get();
//     if (!peerConnection) return;

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);

//     // Send the answer to the caller
//     const { socket } = get();
//     if (!socket) return;

//     socket.emit('send-answer', answer);
//     console.log("Sending Answer: ", answer);
//   },

//   // Handle the incoming answer
//   handleAnswer: (answer) => {
//     const { peerConnection } = get();
//     if (!peerConnection) return;

//     peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//   },

//   // Action to handle ICE candidates from the other peer
//   handleIceCandidate: (candidate) => {
//     const { peerConnection } = get();
//     if (!peerConnection) return;

//     peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//   },
// }));




// import { create } from "zustand";
// import { useAuthStore } from "./useAuthStore.js";

// export const useCallStore = create((set, get) => {
//   return {
//     isReceivingCall: false,
//     isInCall: false,
//     incomingCaller: null,
//     offer: null,
//     peerConnection: null,
//     localStream: null,
//     remoteStream: null,
//     isVideoCallModalOpen: false,

//     setVideoCallModalOpen: (value) => set({ isVideoCallModalOpen: value }),

//     setPeerConnection: (pc) => set({ peerConnection: pc }),

//     callUser: async ({ to }) => {
//       const { socket } = useAuthStore.getState();
//       if (!socket) return;

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       pc.ontrack = (event) => {
//         useCallStore.setState((state) => {
//           const updatedStream = state.remoteStream || new MediaStream();
//           event.streams[0].getTracks().forEach((track) => {
//             if (!updatedStream.getTracks().some((t) => t.id === track.id)) {
//               updatedStream.addTrack(track);
//             }
//           });
//           return { remoteStream: updatedStream };
//         });
//       };

//       const localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       useCallStore.setState({ localStream });

//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", { to, candidate: event.candidate });
//         }
//       };

//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       socket.emit("call-user", { to, offer });

//       localStorage.setItem(
//         "liveCallInfo",
//         JSON.stringify({ to, fullname: "Unknown" })
//       );

//       setTimeout(() => {
//         window.open("/livecall", "_blank");
//       }, 5000);

//       set({ peerConnection: pc, isInCall: true });
//     },

//     acceptCall: async () => {
//       const { offer, incomingCaller } = get();
//       const { socket } = useAuthStore.getState();

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       pc.ontrack = (event) => {
//         useCallStore.setState((state) => {
//           const updatedStream = state.remoteStream || new MediaStream();
//           event.streams[0].getTracks().forEach((track) => {
//             if (!updatedStream.getTracks().some((t) => t.id === track.id)) {
//               updatedStream.addTrack(track);
//             }
//           });
//           return { remoteStream: updatedStream };
//         });
//       };

//       const localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       set({ localStream });

//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", {
//             to: incomingCaller._id,
//             candidate: event.candidate,
//           });
//         }
//       };

//       await pc.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);

//       socket.emit("call-accepted", {
//         to: incomingCaller._id,
//         answer,
//       });

//       localStorage.setItem(
//         "liveCallInfo",
//         JSON.stringify({
//           to: incomingCaller._id,
//           fullname: incomingCaller.fullname,
//         })
//       );

//       setTimeout(() => {
//         window.open("/livecall", "_blank");
//       }, 300);

//       set({
//         peerConnection: pc,
//         isReceivingCall: false,
//         isInCall: true,
//         isVideoCallModalOpen: false,
//       });
//     },

//     endCall: () => {
//       const { peerConnection, localStream, remoteStream } = get();

//       if (peerConnection) peerConnection.close();
//       if (localStream) localStream.getTracks().forEach((track) => track.stop());
//       if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop());

//       set({
//         peerConnection: null,
//         localStream: null,
//         remoteStream: null,
//         isInCall: false,
//         isVideoCallModalOpen: false,
//         incomingCaller: null,
//         offer: null,
//       });
//     },

//     handleSignalingEvents: () => {
//       const { socket } = useAuthStore.getState();
//       if (!socket) return;

//       socket.on("incoming-call", ({ from, offer }) => {
//         set({ isReceivingCall: true, incomingCaller: from, offer });
//       });

//       socket.on("call-accepted", async ({ from, answer }) => {
//         const pc = get().peerConnection;
//         if (pc) {
//           await pc.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on("ice-candidate", async ({ from, candidate }) => {
//         const pc = get().peerConnection;
//         if (pc && candidate) {
//           try {
//             await pc.addIceCandidate(new RTCIceCandidate(candidate));
//           } catch (err) {
//             console.error("Error adding ICE candidate:", err);
//           }
//         }
//       });
//     },
//   };
// });
