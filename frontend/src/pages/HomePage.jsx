import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import useCallStore from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { useTodoStore } from "../store/useTodoStore";
import { initSocket, disconnectSocket } from "../socket";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import IndividualChatContainer from "../components/IndividualChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";
import AiChatContainer from "../components/AiChatContainer";
import VideoPanel from "../components/VideoPanel";
import VideoCallModal from "../components/VideoCallModal";
import GoogleCalendarWidget from "../components/GoogleCalendarWidget";
import TodoListWidget from "../components/TodoListWidget";
import { requestNotificationPermission } from "../lib/notifications";

const HomePage = () => {
  const { selectedUser, selectedGroup, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const { isVideoPanelVisible, initCallSocketListeners } = useCallStore();

  useEffect(() => {
    initCallSocketListeners();
    // Request notification permission but don't let it affect core functionality
    try {
      requestNotificationPermission();
    } catch (error) {
      console.log("[HomePage] Could not request notification permission:", error);
    }
  }, []);

  useEffect(() => {
    if (authUser?._id) {
      console.log("[HomePage] Initializing socket for user:", authUser._id);
      initSocket(authUser._id);
      subscribeToMessages();
      useChatStore.getState().setAuthUser(authUser);
    }

    return () => {
      console.log("[HomePage] Cleaning up socket and message subscriptions");
      unsubscribeFromMessages();
      disconnectSocket();
    };
  }, [authUser?._id]);

  useEffect(() => {
    useTodoStore.getState().fetchTodos();
  }, []);

  let ChatComponent = <NoChatSelected />;
  if (selectedUser) {
    ChatComponent =
      selectedUser.fullName === "AskAI" ? (
        <AiChatContainer />
      ) : (
        <IndividualChatContainer user={selectedUser} />
      );
  } else if (selectedGroup) {
    ChatComponent = <GroupChatContainer group={selectedGroup} />;
  }

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-start justify-center gap-6 pt-20 px-4">
        {/* 📦 Left Widget Box */}
        <div className="bg-base-100 rounded-xl shadow-lg w-96 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
          <div className="flex-1 border-b p-4 overflow-y-auto">
            <GoogleCalendarWidget />
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <TodoListWidget />
          </div>
        </div>

        {/* 📦 Main App Box */}
        <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-6xl h-[calc(100vh-6rem)] relative">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {ChatComponent}
            {isVideoPanelVisible && <VideoPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;


// import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore";
// import { useTodoStore } from "../store/useTodoStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { initSocket, getSocket } from "../socket";
// import Sidebar from "../components/Sidebar";
// import NoChatSelected from "../components/NoChatSelected";
// import IndividualChatContainer from "../components/IndividualChatContainer";
// import GroupChatContainer from "../components/GroupChatContainer";
// import AiChatContainer from "../components/AiChatContainer";
// import VideoPanel from "../components/VideoPanel";
// import VideoCallModal from "../components/VideoCallModal";
// import GoogleCalendarWidget from "../components/GoogleCalendarWidget";
// import TodoListWidget from "../components/TodoListWidget";
// import {
//   requestNotificationPermission,
//   showNotification,
// } from "../lib/notifications";

// const HomePage = () => {
//   const { selectedUser, selectedGroup } = useChatStore();
//   const { authUser } = useAuthStore();
//   const { isVideoPanelVisible, initCallSocketListeners } = useCallStore();

//   useEffect(() => {
//     initCallSocketListeners();
//     requestNotificationPermission();
//     useTodoStore.getState().fetchTodos();
//   }, []);

//   useEffect(() => {
//     if (authUser?._id) {
//       initSocket(authUser._id);
//     }
//   }, [authUser]);

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     const handleNewMessage = (message) => {
//       if (selectedUser && selectedUser._id === message.senderId) return;
//       if (message.senderId === authUser._id) return;
//       showNotification(`New Message from ${message.senderName || "Someone"}`, message.text);
//     };

//     const handleNewGroupMessage = (message) => {
//       if (selectedGroup && selectedGroup._id === message.groupId) return;
//       if (message.senderId === authUser._id) return;
//       showNotification(`New Group Message from ${message.senderName || "Group Member"}`, message.text);
//     };

//     socket.on("newMessage", handleNewMessage);
//     socket.on("newGroupMessage", handleNewGroupMessage);

//     return () => {
//       socket.off("newMessage", handleNewMessage);
//       socket.off("newGroupMessage", handleNewGroupMessage);
//     };
//   }, [selectedUser, selectedGroup, authUser]);

//   let ChatComponent = <NoChatSelected />;
//   if (selectedUser) {
//     ChatComponent =
//       selectedUser.fullName === "AskAI" ? (
//         <AiChatContainer />
//       ) : (
//         <IndividualChatContainer user={selectedUser} />
//       );
//   } else if (selectedGroup) {
//     ChatComponent = <GroupChatContainer group={selectedGroup} />;
//   }

//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-start justify-center gap-6 pt-20 px-4">
//         {/* 📦 Left Widget Box */}
//         <div className="bg-base-100 rounded-xl shadow-lg w-96 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
//           <div className="flex-1 border-b p-4 overflow-y-auto">
//             <GoogleCalendarWidget />
//           </div>
//           <div className="flex-1 p-4 overflow-y-auto">
//             <TodoListWidget />
//           </div>
//         </div>

//         {/* 📦 Main App Box */}
//         <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-6xl h-[calc(100vh-6rem)] relative">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />
//             {ChatComponent}
//             {isVideoPanelVisible && <VideoPanel />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;



// ============= HomePage without Calendar and To do list ======
// import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { initSocket, getSocket } from "../socket"; // ✅ UPDATED
// import Sidebar from "../components/Sidebar";
// import NoChatSelected from "../components/NoChatSelected";
// import IndividualChatContainer from "../components/IndividualChatContainer";
// import GroupChatContainer from "../components/GroupChatContainer";
// import AiChatContainer from "../components/AiChatContainer";
// import VideoPanel from "../components/VideoPanel";
// import VideoCallModal from "../components/VideoCallModal";
// import GoogleCalendarWidget from "../components/GoogleCalendarWidget";

// import {
//   requestNotificationPermission,
//   showNotification,
// } from "../lib/notifications";

// const HomePage = () => {
//   const { selectedUser, selectedGroup } = useChatStore();
//   const { authUser } = useAuthStore();
//   const { isVideoPanelVisible, initCallSocketListeners } = useCallStore();

//   useEffect(() => {
//     initCallSocketListeners();
//     requestNotificationPermission();
//   }, []);

//   // ✅ Initialize socket after authUser is loaded
//   useEffect(() => {
//     if (authUser?._id) {
//       initSocket(authUser._id);
//     }
//   }, [authUser]);

//   // ✅ Notification logic
//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     const handleNewMessage = (message) => {
//       if (selectedUser && selectedUser._id === message.senderId) return;
//       if (message.senderId === authUser._id) return;

//       const senderName = message.senderName || "Someone";
//       showNotification(`New Message from ${senderName}`, message.text);
//     };

//     const handleNewGroupMessage = (message) => {
//       if (selectedGroup && selectedGroup._id === message.groupId) return;
//       if (message.senderId === authUser._id) return;

//       const senderName = message.senderName || "Group Member";
//       showNotification(`New Group Message from ${senderName}`, message.text);
//     };

//     socket.on("newMessage", handleNewMessage);
//     socket.on("newGroupMessage", handleNewGroupMessage);

//     return () => {
//       socket.off("newMessage", handleNewMessage);
//       socket.off("newGroupMessage", handleNewGroupMessage);
//     };
//   }, [selectedUser, selectedGroup, authUser]);

//   let ChatComponent = <NoChatSelected />;

//   if (selectedUser) {
//     ChatComponent =
//       selectedUser.fullName === "AskAI" ? (
//         <AiChatContainer />
//       ) : (
//         <IndividualChatContainer user={selectedUser} />
//       );
//   } else if (selectedGroup) {
//     ChatComponent = <GroupChatContainer group={selectedGroup} />;
//   }

//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-center justify-center pt-20 px-4">
//         <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)] relative">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />
//             {ChatComponent}
//             {isVideoPanelVisible && <VideoPanel />}
//           </div>
//           <VideoCallModal />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;



// ========== Working HomePage.jsx without notifications ===============
// import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useCallStore } from "../store/useCallStore";
// import Sidebar from "../components/Sidebar";
// import NoChatSelected from "../components/NoChatSelected";
// import IndividualChatContainer from "../components/IndividualChatContainer";
// import GroupChatContainer from "../components/GroupChatContainer";
// import AiChatContainer from "../components/AiChatContainer";
// import VideoPanel from "../components/VideoPanel";
// import VideoCallModal from "../components/VideoCallModal";

// const HomePage = () => {
//   const { selectedUser, selectedGroup } = useChatStore();
//   const { isVideoPanelVisible, initCallSocketListeners } = useCallStore();

//   useEffect(() => {
//     initCallSocketListeners(); // Initialize socket listeners on mount
//   }, []);

//   let ChatComponent = <NoChatSelected />;

//   if (selectedUser) {
//     ChatComponent =
//       selectedUser.fullName === "AskAI" ? (
//         <AiChatContainer />
//       ) : (
//         <IndividualChatContainer user={selectedUser} />
//       );
//   } else if (selectedGroup) {
//     ChatComponent = <GroupChatContainer group={selectedGroup} />;
//   }

//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-center justify-center pt-20 px-4">
//         <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)] relative">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />
//             {ChatComponent}
//             {isVideoPanelVisible && <VideoPanel />} {/* ✅ Moved inside main layout */}
//           </div>

//           <VideoCallModal />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;



// ========== Working HomePage.jsx before new approach =====================

// import { useChatStore } from "../store/useChatStore";

// import Sidebar from "../components/Sidebar";
// import NoChatSelected from "../components/NoChatSelected";
// import IndividualChatContainer from "../components/IndividualChatContainer";
// import GroupChatContainer from "../components/GroupChatContainer";
// import AiChatContainer from "../components/AiChatContainer";

// const HomePage = () => {
//   const { selectedUser, selectedGroup } = useChatStore();

//   let ChatComponent = <NoChatSelected />;

//   if (selectedUser) {
//     ChatComponent =
//       selectedUser.fullName === "AskAI" ? (
//         <AiChatContainer />
//       ) : (
//         <IndividualChatContainer user={selectedUser} />
//       );
//   } else if (selectedGroup) {
//     ChatComponent = <GroupChatContainer group={selectedGroup} />;
//   }

//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-center justify-center pt-20 px-4">
//         <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />
//             {ChatComponent}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomePage;


// import { useChatStore } from "../store/useChatStore";

// import Sidebar from "../components/Sidebar";
// import NoChatSelected from "../components/NoChatSelected";
// import ChatContainer from "../components/ChatContainer";

// const HomePage = () => {
//   const { selectedUser, selectedGroup } = useChatStore();

//   return (
//     <div className="h-screen bg-base-200">
//       <div className="flex items-center justify-center pt-20 px-4">
//         <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />

//             {!selectedUser && !selectedGroup ? <NoChatSelected /> : <ChatContainer />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default HomePage;
