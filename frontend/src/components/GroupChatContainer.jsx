import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup && selectedGroup._id) {
      getMessages(selectedGroup._id, "group");
      subscribeToMessages("group");
    }
    return () => unsubscribeFromMessages("group");
  }, [selectedGroup?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  
  if (!authUser || !selectedGroup) return null;

  // if (!authUser || !selectedGroup) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center">
  //       <p>Please select a group to start messaging.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((messageData) => {
          // Handle both direct messages and nested message structure
          const message = messageData.message || messageData;
          const senderId = message.senderId?._id || message.senderId;
          const isSentByMe = senderId === authUser._id;
          console.log("isSentbyMe Variable: ",isSentByMe);
          console.log("message.senderId:", message.senderId);
          console.log("authUser._id:", authUser._id);
          console.log("Message: ", message);

          return (
            <div
              key={message._id}
              className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId?.profilePic
                        ? message.senderId.profilePic
                        : "/avatar.png"
                    }
                    alt={message.senderId?.fullName || "User"}
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <span className="font-medium">
                  {message.senderId?.fullName || "Unknown"}
                </span>
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput />
    </div>
  );
}
export default GroupChatContainer;


//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => {
//           const senderId =
//             typeof message.senderId === "string"
//               ? message.senderId
//               : message.senderId?._id;
//           const isSentByMe = senderId === authUser._id;

//           return (
//             <div
//               key={message._id}
//               className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
//               ref={messageEndRef}
//             >
//               <div className="chat-image avatar">
//                 <div className="size-10 rounded-full border">
//                   <img
//                     src={
//                       message.senderId?.profilePic
//                         ? message.senderId.profilePic
//                         : "/avatar.png"
//                     }
//                     alt={message.senderId?.fullName || "User"}
//                   />
//                 </div>
//               </div>
//               <div className="chat-header mb-1">
//                 <span className="font-medium">
//                   {message.senderId?.fullName ?? "Unknown"}
//                 </span>
//                 <time className="text-xs opacity-50 ml-1">
//                   {formatMessageTime(message.createdAt)}
//                 </time>
//               </div>
//               <div className="chat-bubble flex flex-col">
//                 {message.image && (
//                   <img
//                     src={message.image}
//                     alt="Attachment"
//                     className="sm:max-w-[200px] rounded-md mb-2"
//                   />
//                 )}
//                 {message.text && <p>{message.text}</p>}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       <p>FOR TESTING ONLY: HELLO WORLD</p>
//       <MessageInput />
//     </div>
//   );
// };

// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { useEffect, useRef } from "react";
// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { formatMessageTime } from "../lib/utils";

// const GroupChatContainer = () => {
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
//     if (selectedUser && selectedUser._id) {
//       getMessages(selectedUser._id);
//       subscribeToMessages();
//     }
//     return () => unsubscribeFromMessages();
//   }, [selectedUser?._id]);

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

//   if (!authUser || !selectedUser) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <p>Please select a chat to start messaging.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => {
//           const senderId =
//             typeof message.senderId === "string"
//               ? message.senderId
//               : message.senderId?._id;
//           const isSentByMe = senderId === authUser._id;

//           return (
//             <div
//               key={message._id}
//               className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
//               ref={messageEndRef}
//             >
//               <div className="chat-image avatar">
//                 <div className="size-10 rounded-full border">
//                   <img
//                     src={
//                       message.senderId?.profilePic
//                         ? message.senderId.profilePic
//                         : "/avatar.png"
//                     }
//                     alt={message.senderId?.fullName || "User"}
//                   />
//                 </div>
//               </div>
//               <div className="chat-header mb-1">
//                 <span className="font-medium">
//                   {message.senderId?.fullName || "Unknown"}
//                 </span>
//                 <time className="text-xs opacity-50 ml-1">
//                   {formatMessageTime(message.createdAt)}
//                 </time>
//               </div>
//               <div className="chat-bubble flex flex-col">
//                 {message.image && (
//                   <img
//                     src={message.image}
//                     alt="Attachment"
//                     className="sm:max-w-[200px] rounded-md mb-2"
//                   />
//                 )}
//                 {message.text && <p>{message.text}</p>}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// export default GroupChatContainer;


// // import { useChatStore } from "../store/useChatStore";
// // import { useAuthStore } from "../store/useAuthStore";
// // import { useEffect, useRef } from "react";
// // import ChatHeader from "./ChatHeader";
// // import MessageInput from "./MessageInput";
// // import MessageSkeleton from "./skeletons/MessageSkeleton";
// // import { formatMessageTime } from "../lib/utils";

// // const GroupChatContainer = () => {
// //   const {
// //     messages,
// //     getMessages,
// //     isMessagesLoading,
// //     selectedUser,
// //     subscribeToMessages,
// //     unsubscribeFromMessages,
// //   } = useChatStore();

// //   const { authUser } = useAuthStore();
// //   const messageEndRef = useRef(null);

// //   useEffect(() => {
// //     if (selectedUser && selectedUser._id) {
// //       getMessages(selectedUser._id);
// //       subscribeToMessages();
// //     }
// //     return () => unsubscribeFromMessages();
// //   }, [selectedUser?._id]);

// //   useEffect(() => {
// //     if (messageEndRef.current && messages) {
// //       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   }, [messages]);

// //   if (isMessagesLoading) {
// //     return (
// //       <div className="flex-1 flex flex-col overflow-auto">
// //         <ChatHeader />
// //         <MessageSkeleton />
// //         <MessageInput />
// //       </div>
// //     );
// //   }

// //   if (!authUser || !selectedUser) {
// //     return (
// //       <div className="flex-1 flex items-center justify-center">
// //         <p>Please select a chat to start messaging.</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex-1 flex flex-col overflow-auto">
// //       <ChatHeader />

// //       <div className="flex-1 overflow-y-auto p-4 space-y-4">
// //         {messages.map((message) => {
// //           const isSentByMe = message.senderId?._id === authUser._id;
// //           return (
// //             <div
// //               key={message._id}
// //               className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
// //               ref={messageEndRef}
// //             >
// //               <div className="chat-image avatar">
// //                 <div className="size-10 rounded-full border">
// //                   <img
// //                     src={message.senderId?.profilePic || "/avatar.png"}
// //                     alt={message.senderId?.fullName || "User"}
// //                   />
// //                 </div>
// //               </div>
// //               <div className="chat-header mb-1">
// //                 <span className="font-medium">{message.senderId?.fullName || "Unknown"}</span>
// //                 <time className="text-xs opacity-50 ml-1">
// //                   {formatMessageTime(message.createdAt)}
// //                 </time>
// //               </div>
// //               <div className="chat-bubble flex flex-col">
// //                 {message.image && (
// //                   <img
// //                     src={message.image}
// //                     alt="Attachment"
// //                     className="sm:max-w-[200px] rounded-md mb-2"
// //                   />
// //                 )}
// //                 {message.text && <p>{message.text}</p>}
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>

// //       <MessageInput />
// //     </div>
// //   );
// // };

// // export default GroupChatContainer;

// // ====================== OLDER VERSION ==========================

// // import { useChatStore } from "../store/useChatStore";
// // import { useAuthStore } from "../store/useAuthStore";
// // import { useEffect, useRef } from "react";
// // import ChatHeader from "./ChatHeader";
// // import MessageInput from "./MessageInput";
// // import MessageSkeleton from "./skeletons/MessageSkeleton";
// // import { formatMessageTime } from "../lib/utils";

// // const GroupChatContainer = () => {
// //   const {
// //     messages,
// //     getMessages,
// //     isMessagesLoading,
// //     selectedUser, // here selectedUser is assumed to be a group object
// //     subscribeToMessages,
// //     unsubscribeFromMessages,
// //   } = useChatStore();

// //   const { authUser } = useAuthStore();
// //   const messageEndRef = useRef(null);

// //   useEffect(() => {
// //     getMessages(selectedUser._id);
// //     subscribeToMessages();
// //     return () => unsubscribeFromMessages();
// //   }, [selectedUser._id]);

// //   useEffect(() => {
// //     if (messageEndRef.current && messages) {
// //       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   }, [messages]);

// //   if (isMessagesLoading) {
// //     return (
// //       <div className="flex-1 flex flex-col overflow-auto">
// //         <ChatHeader />
// //         <MessageSkeleton />
// //         <MessageInput />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex-1 flex flex-col overflow-auto">
// //       <ChatHeader />

// //       <div className="flex-1 overflow-y-auto p-4 space-y-4">
// //         {messages.map((message) => {
// //           const isSentByMe = message.senderId._id === authUser._id;
// //           return (
// //             <div
// //               key={message._id}
// //               className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
// //               ref={messageEndRef}
// //             >
// //               <div className="chat-image avatar">
// //                 <div className="size-10 rounded-full border">
// //                   <img
// //                     src={message.senderId.profilePic || "/avatar.png"}
// //                     alt={message.senderId.fullName}
// //                   />
// //                 </div>
// //               </div>
// //               <div className="chat-header mb-1">
// //                 <span className="font-medium">{message.senderId.fullName}</span>
// //                 <time className="text-xs opacity-50 ml-1">
// //                   {formatMessageTime(message.createdAt)}
// //                 </time>
// //               </div>
// //               <div className="chat-bubble flex flex-col">
// //                 {message.image && (
// //                   <img
// //                     src={message.image}
// //                     alt="Attachment"
// //                     className="sm:max-w-[200px] rounded-md mb-2"
// //                   />
// //                 )}
// //                 {message.text && <p>{message.text}</p>}
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>

// //       <MessageInput />
// //     </div>
// //   );
// // };

// // export default GroupChatContainer;
