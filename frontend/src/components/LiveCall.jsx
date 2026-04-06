import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";

const LiveCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ✅ Call each Zustand property individually (no object destructuring)
  const localStream = useChatStore((state) => state.localStream);
  const remoteStream = useChatStore((state) => state.remoteStream);
  const peerConnection = useChatStore((state) => state.peerConnection);
  const setVideoCallModalOpen = useChatStore((state) => state.setVideoCallModalOpen);

  // 🔁 Get call info from localStorage
  const callInfo = JSON.parse(localStorage.getItem("liveCallInfo"));

  // Setup local stream
  useEffect(() => {
    const setupLocal = async () => {
      if (!localStream) {
        try {
          const newLocalStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          useChatStore.setState({ localStream: newLocalStream });

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newLocalStream;
          }

          // Attach local tracks to peer connection
          if (peerConnection) {
            newLocalStream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, newLocalStream);
            });
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
        }
      } else {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    };

    setupLocal();
  }, [localStream, peerConnection]);

  // Setup remote stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("✅ remoteStream applied to video:", remoteStream);
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    useChatStore.getState().endCall();
    window.location.href = "/login";
   // window.close();
  };

  console.log("localStream", localStream);
  console.log("remoteStream", remoteStream);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-white rounded-xl shadow-lg p-2">
            <p className="text-center font-semibold mb-2">You</p>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-[400px] h-[300px] bg-black rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-2">
            <p className="text-center font-semibold mb-2">Other</p>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-[400px] h-[300px] bg-black rounded-lg"
            />
          </div>
        </div>
        <button
          onClick={handleEndCall}
          className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default LiveCall;



// import { useEffect, useRef } from "react";
// import { useChatStore } from "../store/useChatStore";

// const LiveCall = () => {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const {
//     localStream,
//     remoteStream,
//     setPeerConnection,
//     peerConnection,
//     setVideoCallModalOpen,
//   } = useChatStore();

//   // 🔁 Get call info from localStorage
//   const callInfo = JSON.parse(localStorage.getItem("liveCallInfo"));

//   useEffect(() => {
//     const setupStreams = async () => {
//       // Setup local stream
//       if (!localStream) {
//         try {
//           const newLocalStream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: true,
//           });

//           useChatStore.setState({ localStream: newLocalStream });

//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = newLocalStream;
//           }

//           // Reattach to peer connection if needed
//           if (peerConnection) {
//             newLocalStream.getTracks().forEach((track) => {
//               peerConnection.addTrack(track, newLocalStream);
//             });
//           }
//         } catch (err) {
//           console.error("Error accessing media devices:", err);
//         }
//       } else {
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = localStream;
//         }
//       }

//       // Setup remote stream
//       if (remoteStream && remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStream;
//       }
//     };

//     setupStreams();
//   }, [localStream, remoteStream, peerConnection]);

//   console.log("localStream", localStream);
//   console.log("remoteStream", remoteStream);
//   const handleEndCall = () => {
//     useChatStore.getState().endCall();
//     window.close();
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="flex flex-col items-center gap-4">
//         <div className="flex gap-4">
//           <div className="bg-white rounded-xl shadow-lg p-2">
//             <p className="text-center font-semibold mb-2">You</p>
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               className="w-[400px] h-[300px] bg-black rounded-lg"
//             />
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-2">
//             <p className="text-center font-semibold mb-2">Other</p>
//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               className="w-[400px] h-[300px] bg-black rounded-lg"
//             />
//           </div>
//         </div>
//         <button
//           onClick={handleEndCall}
//           className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
//         >
//           End Call
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LiveCall;


// import { useEffect, useRef } from "react";
// import { useChatStore } from "../store/useChatStore";

// const LiveCall = () => {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const { localStream, remoteStream } = useChatStore();

//   useEffect(() => {
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//     }
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [localStream, remoteStream]);

//   console.log("localStream", localStream);
//   console.log("remoteStream", remoteStream);

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="flex gap-4">
//         <div className="bg-white rounded-xl shadow-lg p-2">
//           <p className="text-center font-semibold mb-2">You</p>
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             className="w-[400px] h-[300px] bg-black rounded-lg"
//           />
//         </div>
//         <div className="bg-white rounded-xl shadow-lg p-2">
//           <p className="text-center font-semibold mb-2">Other</p>
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-[400px] h-[300px] bg-black rounded-lg"
//           />
//         </div>
//         <button variant = "contained">End Call</button>

//       </div>
//     </div>
//   );
// };

// export default LiveCall;


// import React, { useEffect, useRef } from "react";
// import { useChatStore } from "../store/useChatStore"; // Assuming you're using Zustand for state management

// const LiveCall = () => {
//   const {
//     localStream,
//     remoteStream,
//     incomingCaller,
//     endCall,
//     peerConnection,
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

//   return (
//     <div className="flex flex-col items-center justify-center bg-gray-800 h-full p-4">
//       <h2 className="text-white text-2xl mb-4">
//         Video Call with {incomingCaller?.fullname || "Unknown"}
//       </h2>
//       <div className="flex justify-between w-full mb-4">
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           className="w-1/2 h-60 border border-gray-300"
//         />
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           className="w-1/2 h-60 border border-gray-300"
//         />
//       </div>
//       <div className="flex space-x-4">
//         <button
//           onClick={endCall}
//           className="bg-red-600 text-white px-6 py-2 rounded"
//         >
//           End Call
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LiveCall;
