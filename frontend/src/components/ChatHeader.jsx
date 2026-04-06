import { Phone, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import useCallStore from "../store/useCallStore"; // If using call logic from Zustand
import { getMediaStream } from "../lib/webrtc"; // Make sure the path is correct

const ChatHeader = () => {
  const {
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore(); // Optional: only if using Zustand-based call logic

  const isGroup = !!selectedGroup;
  const avatar = isGroup
    ? selectedGroup.groupAvatar || "/group-avatar.png"
    : selectedUser?.profilePic || "/avatar.png";

  const name = isGroup ? selectedGroup.name : selectedUser?.fullName;
  const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

  const handleClose = () => {
    if (isGroup) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  const handleCallClick = async () => {
    try {
      const localStream = await getMediaStream();
      if (!localStream) throw new Error("Unable to access camera/microphone.");

      console.log("Local stream ready for call:", localStream);

      // Call logic depending on whether you're using Zustand or manual socket emit
      if (!isGroup && selectedUser) {
        startCall(selectedUser._id, localStream); // Zustand-based logic
        // Or manually emit socket event here if not using Zustand
      }
    } catch (err) {
      console.error("Call setup failed:", err);
      alert("Call setup failed: " + err.message);
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={avatar} alt={name} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            {!isGroup && (
              <p className="text-sm text-base-content/70">
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Call and Close buttons */}
        <div className="flex items-center gap-2">
          {!isGroup && (
            <button
              onClick={handleCallClick}
              className="p-2 rounded-full hover:bg-base-200 transition"
              title="Start Call"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-base-200 transition"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;



// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

// const ChatHeader = () => {
//   const {
//     selectedUser,
//     selectedGroup,
//     setSelectedUser,
//     setSelectedGroup,
//   } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   const isGroup = !!selectedGroup;
//   const avatar = isGroup
//     ? selectedGroup.groupAvatar || "/group-avatar.png"
//     : selectedUser?.profilePic || "/avatar.png";

//   const name = isGroup ? selectedGroup.name : selectedUser?.fullName;

//   const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

//   const handleClose = () => {
//   if (isGroup) {
//     console.log("Clearing selectedGroup...");
//     setSelectedGroup(null);
//     console.log("After clear:", selectedGroup);
//   } else {
//     console.log("Clearing selectedUser...");
//     setSelectedUser(null);
//     console.log("After clear:", selectedUser);
//   }
// };


//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={avatar} alt={name} />
//             </div>
//           </div>

//           {/* Info */}
//           <div>
//             <h3 className="font-medium">{name}</h3>
//             {!isGroup && (
//               <p className="text-sm text-base-content/70">
//                 {isOnline ? "Online" : "Offline"}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={handleClose}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;


// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

// const ChatHeader = () => {
//   const {
//     selectedUser,
//     selectedGroup,
//     setSelectedUser,
//     setSelectedGroup,
//   } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   const isGroup = !!selectedGroup;
//   const avatar = isGroup
//     ? selectedGroup.groupAvatar || "/group-avatar.png"
//     : selectedUser?.profilePic || "/avatar.png";

//   const name = isGroup ? selectedGroup.groupName : selectedUser?.fullName;

//   const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id);

//   const handleClose = () => {
//     if (isGroup) {
//       setSelectedGroup(null);
//     } else {
//       setSelectedUser(null);
//     }
//   };

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={avatar} alt={name} />
//             </div>
//           </div>

//           {/* Info */}
//           <div>
//             <h3 className="font-medium">{name}</h3>
//             {!isGroup && (
//               <p className="text-sm text-base-content/70">
//                 {isOnline ? "Online" : "Offline"}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={handleClose}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;


// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

// const ChatHeader = () => {
//   const { selectedUser, setSelectedUser } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
//             </div>
//           </div>

//           {/* User info */}
//           <div>
//             <h3 className="font-medium">{selectedUser.fullName}</h3>
//             <p className="text-sm text-base-content/70">
//               {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
//             </p>
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={() => setSelectedUser(null)}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };
// export default ChatHeader;
