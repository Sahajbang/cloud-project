import useCallStore from "../store/useCallStore";
import { getMediaStream, createPeerConnection } from "../lib/webrtc";

const VideoCallModal = () => {
  const {
    isReceivingCall,
    incomingCaller,
    incomingOffer,
    setIsInCall,
    setVideoCallPanelOpen,
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    endCall,
    sendAnswer,
  } = useCallStore();

  const handleAccept = async () => {
    try {
      console.log("📞 Accepting call...");
      const localStream = await getMediaStream();
      if (!localStream) throw new Error("Local media stream not available");

      setLocalStream(localStream);

      const pc = createPeerConnection({
        onIceCandidate: (candidate) => {
          if (candidate) {
            console.log("📡 Sending ICE candidate from receiver");
            useCallStore.getState().sendIceCandidate({
              to: incomingCaller._id,
              candidate,
            });
          }
        },
        onTrack: (remoteStream) => {
          console.log("🎥 Received remote stream on receiver side", remoteStream);
          setRemoteStream(remoteStream);
        },
        onConnectionStateChange: (state) => {
          console.log("🔄 Connection state (receiver):", state);
        },
      });

      // Add local tracks to the connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      setPeerConnection(pc);

      // Set the remote offer and create/send answer
      await pc.setRemoteDescription(incomingOffer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendAnswer({
        to: incomingCaller._id,
        answer,
      });

      setIsInCall(true);
      setVideoCallPanelOpen(true);
    } catch (err) {
      console.error("Error accepting the call:", err);
      alert("Could not accept the call.");
    }
  };

  const handleReject = () => {
    console.log("❌ Rejecting call");
    endCall();
  };

  if (!isReceivingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[1100] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4 w-80">
        <h2 className="text-xl font-bold text-gray-900">Incoming Video Call</h2>
        <p className="text-gray-600">
          {incomingCaller?.fullName || "Someone"} is calling you
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;


// import { useEffect, useRef } from "react";
// import { useCallStore } from "../store/useCallStore";
// import { getMediaStream } from "../lib/webrtc";

// const VideoCallModal = () => {
//   const {
//     isReceivingCall,
//     incomingCaller,
//     acceptCall,
//     endCall,
//     createAnswer,
//     peerConnection,
//     setLocalStream,
//     setVideoCallPanelOpen,
//   } = useCallStore();

//   const handleAccept = async () => {
//     try {
//       const localStream = await getMediaStream();
//       setLocalStream(localStream);

//       localStream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, localStream);
//       });

//       await acceptCall(); // sets `isInCall = true`, etc.
//       await createAnswer(peerConnection); // generates answer and sends it

//       setVideoCallPanelOpen(true); // Show video panel
//     } catch (error) {
//       console.error("Error accepting call:", error);
//     }
//   };

//   const handleReject = () => {
//     endCall();
//   };

//   if (!isReceivingCall) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
//         <h2 className="text-xl font-bold">Incoming Video Call</h2>
//         <p className="text-gray-600">{incomingCaller?.fullName || "Unknown Caller"} is calling you</p>
//         <div className="flex justify-center gap-4 mt-4">
//           <button onClick={handleAccept} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
//             Accept
//           </button>
//           <button onClick={handleReject} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
//             Reject
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCallModal;


// import { useEffect, useRef } from "react";
// import { useCallStore } from "../store/useCallStore"; // Make sure to import the new store
// //import { useChatStore } from "../store/useChatStore"; // If still needed, keep this for general chat data

// const VideoCallModal = () => {
//   const {
//     isReceivingCall,   // for incoming call
//     isInCall,          // for ongoing call
//     incomingCaller,    // user who is calling
//     localStream,
//     remoteStream,
//     acceptCall,
//     endCall,
//   } = useCallStore(); // Use the new call store

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   useEffect(() => {
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//     }
//   }, [localStream]);

//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   // Show modal only if there is an incoming call or if the user is in an ongoing call
//   if (!isReceivingCall && !isInCall) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
//       <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
//         {isReceivingCall && !isInCall ? (
//           <>
//             <p className="text-xl font-semibold">
//               Incoming Call from {incomingCaller?.fullname || "Unknown"}...
//             </p>
//             <div className="mt-4 flex justify-around">
//               <button
//                 onClick={acceptCall}
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={endCall}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Reject
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="flex justify-around mb-4">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 muted
//                 className="w-1/2 h-48 border border-gray-300"
//               />
//               <video
//                 ref={remoteVideoRef}
//                 autoPlay
//                 className="w-1/2 h-48 border border-gray-300"
//               />
//             </div>
//             <button
//               onClick={endCall}
//               className="bg-red-600 text-white px-6 py-2 rounded"
//             >
//               End Call
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoCallModal;

// ===== Video Calling Older Approach =========

// import React, { useEffect, useRef } from "react";
// import { useChatStore } from "../store/useChatStore";

// const VideoCallModal = () => {
//   const {
//     isReceivingCall,  // for incoming call
//     isInCall,         // for ongoing call
//     incomingCaller,    // user who is calling
//     localStream,
//     remoteStream,
//     acceptCall,
//     endCall,
//   } = useChatStore();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   useEffect(() => {
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//     }
//   }, [localStream]);

//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   // Show modal only if there is an incoming call or if the user is in an ongoing call
//   if (!isReceivingCall && !isInCall) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
//       <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
//         {isReceivingCall && !isInCall ? (
//           <>
//             <p className="text-xl font-semibold">
//               Incoming Call from {incomingCaller?.fullname || "Unknown"}...
//             </p>
//             <div className="mt-4 flex justify-around">
//               <button
//                 onClick={acceptCall}
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={endCall}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Reject
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="flex justify-around mb-4">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 muted
//                 className="w-1/2 h-48 border border-gray-300"
//               />
//               <video
//                 ref={remoteVideoRef}
//                 autoPlay
//                 className="w-1/2 h-48 border border-gray-300"
//               />
//             </div>
//             <button
//               onClick={endCall}
//               className="bg-red-600 text-white px-6 py-2 rounded"
//             >
//               End Call
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoCallModal;

