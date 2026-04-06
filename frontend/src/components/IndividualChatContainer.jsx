import { useChatStore } from "../store/useChatStore";
import useCallStore from "../store/useCallStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import VideoPanel from "./VideoPanel";
import { getMediaStream, createPeerConnection, closePeerConnection } from "../lib/webrtc";

const IndividualChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const {
    peerConnection,
    setPeerConnection,
    callUser,
    setVideoCallPanelOpen,
    isVideoPanelVisible: isVideoCallPanelVisible,
    setLocalStream,
    setRemoteStream,
    sendIceCandidate,
  } = useCallStore();

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCloseClick = () => {
    const { peerConnection, setPeerConnection } = useCallStore.getState();

    if (peerConnection) {
      closePeerConnection(peerConnection);
      setPeerConnection(null);
    }

    setSelectedUser(null);
    setVideoCallPanelOpen(false);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader handleCloseClick={handleCloseClick} selectedUser={selectedUser} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img src={message.senderAvatar} alt="Avatar" />
              </div>
            </div>
            <div className="chat-header">
              {message.senderName} <span className="text-sm">{formatMessageTime(message.createdAt)}</span>
            </div>
            <div className="chat-bubble">{message.text}</div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default IndividualChatContainer;


// ============ Working IndividualChatContainer.jsx without UI/UX Changes ====

// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone, X } from "lucide-react";
// import VideoPanel from "./VideoPanel";
// import { getMediaStream, createPeerConnection, closePeerConnection } from "../lib/webrtc";

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();

//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   const {
//     peerConnection,
//     setPeerConnection,
//     callUser,
//     setVideoCallPanelOpen,
//     isVideoPanelVisible: isVideoCallPanelVisible,
//     setLocalStream,
//     setRemoteStream,
//     sendIceCandidate, // ✅ pulled from call store
//   } = useCallStore();

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleCallClick = async (receiverId) => {
//   console.log("Call button clicked for:", receiverId);

//   try {
//     const {
//       peerConnection,
//       setPeerConnection,
//       callUser,
//       setLocalStream,
//       setRemoteStream,
//       sendIceCandidate,
//       setVideoCallPanelOpen,
//     } = useCallStore.getState();

//     // Clean up existing peer connection
//     if (peerConnection) {
//       console.log("Cleaning up existing peer connection...");
//       closePeerConnection(peerConnection);
//       setPeerConnection(null);
//     }

//     // Step 1: Get media
//     console.log("Getting local media stream...");
//     const localStream = await getMediaStream();
//     if (!localStream) throw new Error("Local stream not available");
//     console.log("Local stream obtained:", localStream);
//     setLocalStream(localStream);

//     // Step 2: Create peer connection
//     console.log("Creating new RTCPeerConnection...");
//     const pc = createPeerConnection({
//       onIceCandidate: (candidate) => {
//         if (candidate) {
//           console.log("ICE candidate gathered:", candidate);
//           sendIceCandidate({ to: receiverId, candidate });
//         }
//       },
//       onTrack: (remoteStream) => {
//         console.log("Remote track received:", remoteStream);
//         setRemoteStream(remoteStream);
//       },
//       onConnectionStateChange: (state) => {
//         console.log("Connection state changed:", state);
//       },
//     });

//     localStream.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream);
//     });

//     setPeerConnection(pc);

//     // Step 3: Create and send offer
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     console.log("Local offer created and set:", offer);

//     callUser({ to: receiverId, offer: pc.localDescription });
//     console.log("callUser triggered.");

//     // Step 4: Open video panel
//     setVideoCallPanelOpen(true);
//     console.log("Video call panel should now be visible.");
//   } catch (err) {
//     console.error("Call setup failed:", err);
//     alert("Call setup failed: " + err.message);
//   }
// };

//   const handleCloseClick = () => {
//     const { peerConnection, setPeerConnection } = useCallStore.getState();

//     if (peerConnection) {
//       closePeerConnection(peerConnection);
//       setPeerConnection(null);
//     }

//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }

//     setSelectedUser(null);
//     setVideoCallPanelOpen(false);
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => handleCallClick(selectedUser._id)}
//             title="Start Call"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <Phone className="w-5 h-5" />
//           </button>
//           <div className="h-5 border-l border-base-300"></div>
//           <button
//             onClick={handleCloseClick}
//             title="Close Chat"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img src={message.senderAvatar} alt="Avatar" />
//               </div>
//             </div>
//             <div className="chat-header">
//               {message.senderName} <span className="text-sm">{formatMessageTime(message.createdAt)}</span>
//             </div>
//             <div className="chat-bubble">{message.text}</div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />

//       {/* {isVideoCallPanelVisible && <VideoPanel />} */}
//     </div>
//   );
// };

// export default IndividualChatContainer;



// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore"; // Import useCallStore
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone, X } from "lucide-react"; // 📞 Call + ❌ Close icons
// import VideoPanel from "./VideoPanel"; // Import VideoPanel
// import { getMediaStream, createPeerConnection, closePeerConnection } from "../lib/webrtc";

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);
//   const {
//     peerConnection,
//     setPeerConnection,
//     callUser,
//     setVideoCallPanelOpen, // Using call store for video panel visibility
//     isVideoPanelVisible,    // Managed by useCallStore
//     sendIceCandidate,
//   } = useCallStore(); // Accessing video call state and actions from useCallStore

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

// const handleCallClick = async (receiverId) => {
//   try {
//     const {
//       peerConnection,
//       setPeerConnection,
//       callUser,
//       sendIceCandidate,
//       setLocalStream,
//       setVideoCallPanelOpen,
//     } = useCallStore.getState();

//     // Clean up existing connection if any
//     if (peerConnection) {
//       closePeerConnection(peerConnection);
//       setPeerConnection(null);
//     }

//     // Get local media stream
//     const localStream = await getMediaStream();

//     if (!localStream) {
//       throw new Error("Local media stream not available");
//     }

//     // Show local stream in UI
//     setLocalStream(localStream);

//     // Create a new peer connection with handlers
//     const pc = createPeerConnection({
//       onIceCandidate: (candidate) => {
//         if (candidate) {
//           sendIceCandidate({ to: receiverId, candidate });
//         }
//       },
//       onTrack: (remoteStream) => {
//         console.log("Remote stream received", remoteStream);
//         useCallStore.getState().setRemoteStream(remoteStream);
//       },
//       onConnectionStateChange: (state) => {
//         console.log("Connection state:", state);
//       },
//     });

//     // Add local tracks to peer connection
//     localStream.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream);
//     });

//     setPeerConnection(pc);

//     // Create and send offer
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     callUser({ to: receiverId, offer: pc.localDescription });

//     // Open the video call panel in UI
//     setVideoCallPanelOpen(true);
//   } catch (error) {
//     console.error("Error setting up call:", error);
//     alert("Failed to start the call. Please check permissions or try again.");
//   }
// };

//   const handleCloseClick = () => {
//     setSelectedUser(null);  // Deselect the user when chat is closed
//     setVideoCallPanelOpen(false); // Close the VideoPanel when chat is closed
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       {/* Header with ChatHeader + buttons */}
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleCallClick}
//             title="Start Call"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <Phone className="w-5 h-5" />
//           </button>

//           {/* Vertical Divider */}
//           <div className="h-5 border-l border-base-300"></div>

//           <button
//             onClick={handleCloseClick}
//             title="Close Chat"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img src={message.senderAvatar} alt="Avatar" />
//               </div>
//             </div>
//             <div className="chat-header">
//               {message.senderName} <span className="text-sm">{formatMessageTime(message.createdAt)}</span>
//             </div>
//             <div className="chat-bubble">{message.text}</div>
//           </div>
//         ))}
//       </div>

//       {/* Input Section */}
//       <MessageInput />
      
//       {/* Video Call Panel */}
//       {isVideoPanelVisible && <VideoPanel />} {/* Show VideoPanel when a call is active */}
//     </div>
//   );
// };

// export default IndividualChatContainer;


// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore"; // Import useCallStore
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone, X } from "lucide-react"; // 📞 Call + ❌ Close icons
// import { createPeerConnection, getMediaStream } from "../lib/webrtc";
// import VideoPanel from "./VideoPanel"; // Import VideoPanel

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);
//   const {
//     peerConnection,
//     setPeerConnection,
//     callUser,
//     setVideoCallPanelOpen, // Using call store for video panel visibility
//     isVideoPanelVisible,    // Managed by useCallStore
//     sendIceCandidate,
//   } = useCallStore(); // Accessing video call state and actions from useCallStore

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleCallClick = async () => {
//     try {
//       // Close existing peer connection if it exists
//       if (peerConnection) {
//         peerConnection.close();
//         setPeerConnection(null);
//       }

//       // Get the local media stream (audio and video)
//       const localStream = await getMediaStream();

//       // Create a new peer connection with event handlers
//       const pc = createPeerConnection({
//         onIceCandidate: (candidate) => {
//           if (candidate) {
//             // Send the ICE candidate to the other user
//             sendIceCandidate({
//               to: selectedUser._id,
//               candidate,
//             });
//           }
//         },
//         onTrack: (remoteStream) => {
//           console.log("Received remote stream", remoteStream);
//         },
//         onConnectionStateChange: (state) => {
//           if (state === "connected") {
//             console.log("Peer connection established!");
//           }
//         },
//       });

//       // Add tracks to the peer connection
//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });

//       // Save the peer connection in the store
//       setPeerConnection(pc);

//       // Create and send the offer to the selected user
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       callUser({
//         to: selectedUser._id,
//         offer,
//       });

//       // Trigger the VideoPanel to slide in after the call is initiated
//       setVideoCallPanelOpen(true);
//     } catch (error) {
//       console.error("Error during call setup:", error);
//     }
//   };

//   const handleCloseClick = () => {
//     setSelectedUser(null);  // Deselect the user when chat is closed
//     setVideoCallPanelOpen(false); // Close the VideoPanel when chat is closed
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       {/* Header with ChatHeader + buttons */}
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleCallClick}
//             title="Start Call"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <Phone className="w-5 h-5" />
//           </button>

//           {/* Vertical Divider */}
//           <div className="h-5 border-l border-base-300"></div>

//           <button
//             onClick={handleCloseClick}
//             title="Close Chat"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={message.senderId === authUser._id
//                     ? authUser.profilePic || "/avatar.png"
//                     : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <MessageInput />

//       {/* Video Panel - This will slide into the view when the call is active */}
//       {isVideoPanelVisible && <VideoPanel />}
//     </div>
//   );
// };

// export default IndividualChatContainer;

// ============= 22.05.25 12:36PM ====================
// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore"; // Import useCallStore
// import { useEffect, useRef, useState } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone, X } from "lucide-react"; // 📞 Call + ❌ Close icons
// import { createPeerConnection, getMediaStream } from "../lib/webrtc";
// import VideoPanel from "./VideoPanel"; // Import VideoPanel

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);
//   const {
//     peerConnection,
//     setPeerConnection,
//     callUser,
//     setVideoCallPanelOpen, // Using call store for video panel visibility
//     isVideoPanelVisible,    // Managed by useCallStore
//     sendIceCandidate,
//   } = useCallStore(); // Accessing video call state and actions from useCallStore

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleCallClick = async () => {
//     try {
//       if (peerConnection) {
//         peerConnection.close();
//         setPeerConnection(null);
//       }

//       const localStream = await getMediaStream();

//       const pc = createPeerConnection({
//         onIceCandidate: (candidate) => {
//           if (candidate) {
//             sendIceCandidate({
//               to: selectedUser._id,
//               candidate,
//             });
//           }
//         },
//         onTrack: (remoteStream) => {
//           console.log("Received remote stream", remoteStream);
//         },
//         onConnectionStateChange: (state) => {
//           if (state === "connected") {
//             console.log("Peer connection established!");
//           }
//         },
//       });

//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });

//       setPeerConnection(pc);

//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       callUser({
//         to: selectedUser._id,
//         offer,
//       });

//       // Trigger the VideoPanel to slide in
//       setVideoCallPanelOpen(true);
//     } catch (error) {
//       console.error("Error during call setup:", error);
//     }
//   };

//   const handleCloseClick = () => {
//     setSelectedUser(null);
//     setVideoCallPanelOpen(false); // Close the VideoPanel when chat is closed
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       {/* Header with ChatHeader + buttons */}
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleCallClick}
//             title="Start Call"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <Phone className="w-5 h-5" />
//           </button>

//           {/* Vertical Divider */}
//           <div className="h-5 border-l border-base-300"></div>

//           <button
//             onClick={handleCloseClick}
//             title="Close Chat"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={message.senderId === authUser._id
//                     ? authUser.profilePic || "/avatar.png"
//                     : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <MessageInput />

//       {/* Video Panel - This will slide into the view when the call is active */}
//       {isVideoPanelVisible && <VideoPanel />}
//     </div>
//   );
// };

// export default IndividualChatContainer;


// ============= Working IndividualChatContainer.jsx before new approach =====

// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone, X } from "lucide-react"; // 📞 Call + ❌ Close icons
// import { createPeerConnection, getMediaStream } from "../lib/webrtc";

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     setSelectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//     callUser,
//     setPeerConnection,
//     setVideoCallModalOpen,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleCallClick = async () => {
//     try {
//       const {
//         peerConnection,
//         sendIceCandidate,
//       } = useChatStore.getState();

//       if (peerConnection) {
//         peerConnection.close();
//         setPeerConnection(null);
//       }

//       const localStream = await getMediaStream();

//       const pc = createPeerConnection({
//         onIceCandidate: (candidate) => {
//           if (candidate) {
//             sendIceCandidate({
//               to: selectedUser._id,
//               candidate,
//             });
//           }
//         },
//         onTrack: (remoteStream) => {
//           console.log("Received remote stream", remoteStream);
//         },
//         onConnectionStateChange: (state) => {
//           if (state === "connected") {
//             console.log("Peer connection established!");
//           }
//         },
//       });

//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });

//       setPeerConnection(pc);

//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       callUser({
//         to: selectedUser._id,
//         offer,
//       });

//       setVideoCallModalOpen(true);
//     } catch (error) {
//       console.error("Error during call setup:", error);
//     }
//   };

//   const handleCloseClick = () => {
//     setSelectedUser(null);
//   };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       {/* Header with ChatHeader + buttons */}
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleCallClick}
//             title="Start Call"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <Phone className="w-5 h-5" />
//           </button>

//           {/* Vertical Divider */}
//           <div className="h-5 border-l border-base-300"></div>

//           <button
//             onClick={handleCloseClick}
//             title="Close Chat"
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <MessageInput />
//     </div>
//   );
// };

// export default IndividualChatContainer;

//==========Below code is fine, just uncleaned UI elements ===============

// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";
// import { Phone } from "lucide-react"; // 📞 Call icon
// import { createPeerConnection, getMediaStream } from "../lib/webrtc"; // WebRTC helpers

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//     callUser,
//     setPeerConnection,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   const handleCallClick = async () => {
//   try {
//     const {
//       peerConnection,
//       sendIceCandidate,
//       callUser,
//       setVideoCallModalOpen,
//     } = useChatStore.getState(); // only get non-function state values here

//     // We already have setPeerConnection from the hook above
//     // const { setPeerConnection } = useChatStore(); ✅ already declared

//     if (peerConnection) {
//       peerConnection.close();
//       setPeerConnection(null);
//     }

//     const localStream = await getMediaStream();

//     const pc = createPeerConnection({
//       onIceCandidate: (candidate) => {
//         if (candidate) {
//           sendIceCandidate({
//             to: selectedUser._id,
//             candidate,
//           });
//         }
//       },
//       onTrack: (remoteStream) => {
//         // TODO: Attach remoteStream to a video element if needed
//         console.log("Received remote stream", remoteStream);
//       },
//       onConnectionStateChange: (state) => {
//         if (state === "connected") {
//           console.log("Peer connection established!");
//         }
//       },
//     });

//     localStream.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream);
//     });

//     setPeerConnection(pc); // ✅ use the one from the hook

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     callUser({
//       to: selectedUser._id,
//       offer,
//     });

//     setVideoCallModalOpen(true); // ✅ open the modal/tab

//   } catch (error) {
//     console.error("Error during call setup:", error);
//   }
// };

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <div className="flex items-center justify-between px-4 py-2 border-b">
//         <ChatHeader />
//         <button
//           onClick={handleCallClick}
//           title="Start Call"
//           className="p-2 rounded-full hover:bg-base-200 transition"
//         >
//           <Phone className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// export default IndividualChatContainer;

// ============== Working Individual Chat Container without video call feature. =========

// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";

// const IndividualChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);

//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };
// export default IndividualChatContainer

// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { useEffect, useRef } from "react";

// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { formatMessageTime } from "../lib/utils";

// // GroupChatContainer logic is added below
// const GroupChatContainer = () => {
//   const {
//     messages,
//     getGroupMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToGroupMessages,
//     unsubscribeFromGroupMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getGroupMessages(selectedUser._id);
//     subscribeToGroupMessages();

//     return () => unsubscribeFromGroupMessages();
//   }, [selectedUser._id]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.sender._id === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={message.sender.profilePic || "/avatar.png"}
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <span className="font-semibold">{message.sender.fullName}</span>
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// // Main component that switches between user and group chat
// const ChatContainer = () => {
//   const { selectedUser } = useChatStore();

//   if (!selectedUser) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-500">
//         Select a chat to start messaging
//       </div>
//     );
//   }

//   return selectedUser.isGroup ? <GroupChatContainer /> : <DirectChatContainer />;
// };

// // Original DirectChatContainer logic moved here
// const DirectChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id);
//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{message.text}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// export default ChatContainer;
