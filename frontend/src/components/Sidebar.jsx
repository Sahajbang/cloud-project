import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, UsersRound, Bot, Settings } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import EditGroupModal from "./EditGroupModal";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    isUsersLoading,
    groups,
    getGroups,
    unreadMessages,
    hasUnreadMessage,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const handleAskAI = () => {
    setSelectedUser({ _id: "askai", fullName: "AskAI", profilePic: "/ai-avatar.png" });
    setSelectedGroup(null);
  };

  const handleGroupSettingsClick = (groupId) => {
    setEditingGroupId(groupId);
  };

  const closeEditGroupModal = () => {
    setEditingGroupId(null);
  };

  const isOnline = (id) => onlineUsers.includes(id);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => isOnline(user._id))
    : users;

  const unreadUsers = users.filter((user) => hasUnreadMessage(user._id));
  const unreadGroups = groups.filter((group) => hasUnreadMessage(group._id));

  const showUsers =
    activeTab === "contacts"
      ? filteredUsers
      : activeTab === "unread"
      ? unreadUsers
      : [];

  const showGroups =
    activeTab === "groups"
      ? groups
      : activeTab === "unread"
      ? unreadGroups
      : [];

  const hasUnreadChats = unreadUsers.length > 0 || unreadGroups.length > 0;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Sidebar</span>
        </div>

        <div className="flex gap-2 mb-3">
          {["contacts", "groups", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md relative ${
                activeTab === tab
                  ? "bg-base-300 font-semibold"
                  : "text-zinc-500 hover:bg-base-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "unread" && hasUnreadChats && (
                <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "contacts" && (
          <div className="hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">
              ({Math.max(onlineUsers.length - 1, 0)} online)
            </span>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-zinc-500">Your Groups</span>
            <button
              className="btn btn-sm btn-outline text-xs flex items-center gap-1"
              onClick={() => setShowCreateGroup(true)}
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-3 flex-1 flex flex-col justify-between">
        <div>
          {activeTab !== "groups" &&
            showUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {isOnline(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
                  )}
                  {hasUnreadMessage(user._id) && (
                    <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {isOnline(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

          {activeTab !== "contacts" &&
            showGroups.map((group) => (
              <div key={group._id} className="relative group">
                <button
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full p-3 pr-10 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                    selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                  }`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <div className="size-12 bg-base-200 rounded-full flex items-center justify-center">
                      <UsersRound className="w-6 h-6 text-zinc-600" />
                    </div>
                    {hasUnreadMessage(group._id) && (
                      <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-sm text-zinc-400">
                      {group.members.length} members
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleGroupSettingsClick(group._id)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  title="Group Settings"
                >
                  <Settings className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            ))}
        </div>

        {/* AskAI always at bottom of contacts */}
        {activeTab === "contacts" && (
          <div className="border-t border-base-200 pt-2 mt-2">
            <button
              onClick={handleAskAI}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === "askai" ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <div className="size-12 bg-base-200 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">AskAI</div>
                <div className="text-sm text-zinc-400">Chat with AI</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
      <EditGroupModal
        isOpen={Boolean(editingGroupId)}
        onClose={closeEditGroupModal}
        group={groups.find((g) => g._id === editingGroupId)}
      />
    </aside>
  );
};

export default Sidebar;

// import { useEffect, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import SidebarSkeleton from "./skeletons/SidebarSkeleton";
// import { Users, Plus, UsersRound, Bot, Settings } from "lucide-react";
// import CreateGroupModal from "./CreateGroupModal";
// import EditGroupModal from "./EditGroupModal";

// const Sidebar = () => {
//   const {
//     getUsers,
//     users,
//     selectedUser,
//     setSelectedUser,
//     selectedGroup,
//     setSelectedGroup,
//     isUsersLoading,
//     groups,
//     getGroups,
//     unreadMessages,
//     hasUnreadMessage,
//   } = useChatStore();

//   const { onlineUsers } = useAuthStore();

//   const [showOnlineOnly, setShowOnlineOnly] = useState(false);
//   const [activeTab, setActiveTab] = useState("contacts");
//   const [showCreateGroup, setShowCreateGroup] = useState(false);
//   const [editingGroupId, setEditingGroupId] = useState(null);

//   useEffect(() => {
//     getUsers();
//     getGroups();
//   }, []);

//   const handleSelectUser = (user) => {
//     console.log("[Sidebar] Selecting user:", user._id);
//     console.log("[Sidebar] Current unread messages:", unreadMessages);
//     setSelectedUser(user);
//   };

//   const handleSelectGroup = (group) => {
//     console.log("[Sidebar] Selecting group:", group._id);
//     console.log("[Sidebar] Current unread messages:", unreadMessages);
//     setSelectedGroup(group);
//   };

//   const handleAskAI = () => {
//     setSelectedUser({ _id: "askai", fullName: "AskAI", profilePic: "/ai-avatar.png" });
//     setSelectedGroup(null);
//   };

//   const handleGroupSettingsClick = (groupId) => {
//     setEditingGroupId(groupId);
//   };

//   const closeEditGroupModal = () => {
//     setEditingGroupId(null);
//   };

//   const isOnline = (id) => onlineUsers.includes(id);

//   const filteredUsers = showOnlineOnly
//     ? users.filter((user) => isOnline(user._id))
//     : users;

//   const unreadUsers = users.filter((user) => {
//     const hasUnread = hasUnreadMessage(user._id);
//     console.log("[Sidebar] Checking unread for user:", user._id, "Result:", hasUnread);
//     return hasUnread;
//   });
  
//   const unreadGroups = groups.filter((group) => {
//     const hasUnread = hasUnreadMessage(group._id);
//     console.log("[Sidebar] Checking unread for group:", group._id, "Result:", hasUnread);
//     return hasUnread;
//   });

//   const showUsers =
//     activeTab === "contacts"
//       ? filteredUsers
//       : activeTab === "unread"
//       ? unreadUsers
//       : [];

//   const showGroups =
//     activeTab === "groups"
//       ? groups
//       : activeTab === "unread"
//       ? unreadGroups
//       : [];

//   const hasUnreadChats = unreadUsers.length > 0 || unreadGroups.length > 0;
//   console.log("[Sidebar] Has unread chats:", hasUnreadChats, "Users:", unreadUsers.length, "Groups:", unreadGroups.length);

//   if (isUsersLoading) return <SidebarSkeleton />;

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2 mb-3">
//           <Users className="size-6" />
//           <span className="font-medium hidden lg:block">Sidebar</span>
//         </div>

//         <div className="flex gap-2 mb-3">
//           {["contacts", "groups", "unread"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-3 py-1 text-sm rounded-md relative ${
//                 activeTab === tab
//                   ? "bg-base-300 font-semibold"
//                   : "text-zinc-500 hover:bg-base-200"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//               {tab === "unread" && hasUnreadChats && (
//                 <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full" />
//               )}
//             </button>
//           ))}
//         </div>

//         {activeTab === "contacts" ? (
//           <div className="hidden lg:flex items-center gap-2">
//             <label className="cursor-pointer flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={showOnlineOnly}
//                 onChange={(e) => setShowOnlineOnly(e.target.checked)}
//                 className="checkbox checkbox-sm"
//               />
//               <span className="text-sm">Show online only</span>
//             </label>
//             <span className="text-xs text-zinc-500">
//               ({Math.max(onlineUsers.length - 1, 0)} online)
//             </span>
//           </div>
//         ) : activeTab === "groups" ? (
//           <div className="mt-2 flex justify-between items-center">
//             <span className="text-sm text-zinc-500">Your Groups</span>
//             <button
//               className="btn btn-sm btn-outline text-xs flex items-center gap-1"
//               onClick={() => setShowCreateGroup(true)}
//             >
//               <Plus className="w-4 h-4" />
//               Create
//             </button>
//           </div>
//         ) : null}
//       </div>

//       <div className="overflow-y-auto w-full py-3">
//         {activeTab !== "groups" &&
//           showUsers.map((user) => (
//             <button
//               key={user._id}
//               onClick={() => handleSelectUser(user)}
//               className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
//                 selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
//               }`}
//             >
//               <div className="relative mx-auto lg:mx-0">
//                 <img
//                   src={user.profilePic || "/avatar.png"}
//                   alt={user.fullName}
//                   className="size-12 object-cover rounded-full"
//                 />
//                 {isOnline(user._id) && (
//                   <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
//                 )}
//                 {hasUnreadMessage(user._id) && (
//                   <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full" />
//                 )}
//               </div>
//               <div className="hidden lg:block text-left min-w-0">
//                 <div className="font-medium truncate">{user.fullName}</div>
//                 <div className="text-sm text-zinc-400">
//                   {isOnline(user._id) ? "Online" : "Offline"}
//                 </div>
//               </div>
//             </button>
//           ))}

//         {activeTab !== "contacts" &&
//           showGroups.map((group) => (
//             <div key={group._id} className="relative group">
//               <button
//                 onClick={() => handleSelectGroup(group)}
//                 className={`w-full p-3 pr-10 flex items-center gap-3 hover:bg-base-300 transition-colors ${
//                   selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
//                 }`}
//               >
//                 <div className="relative mx-auto lg:mx-0">
//                   <div className="size-12 bg-base-200 rounded-full flex items-center justify-center">
//                     <UsersRound className="w-6 h-6 text-zinc-600" />
//                   </div>
//                   {hasUnreadMessage(group._id) && (
//                     <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full" />
//                   )}
//                 </div>
//                 <div className="hidden lg:block text-left min-w-0">
//                   <div className="font-medium truncate">{group.name}</div>
//                   <div className="text-sm text-zinc-400">
//                     {group.members.length} members
//                   </div>
//                 </div>
//               </button>
//               <button
//                 onClick={() => handleGroupSettingsClick(group._id)}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
//                 title="Group Settings"
//               >
//                 <Settings className="w-4 h-4 text-zinc-500" />
//               </button>
//             </div>
//           ))}

//         {/* AskAI Option */}
//         {activeTab === "contacts" && (
//           <button
//             onClick={handleAskAI}
//             className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
//               selectedUser?._id === "askai" ? "bg-base-300 ring-1 ring-base-300" : ""
//             }`}
//           >
//             <div className="relative mx-auto lg:mx-0">
//               <div className="size-12 bg-base-200 rounded-full flex items-center justify-center">
//                 <Bot className="w-6 h-6 text-blue-500" />
//               </div>
//             </div>
//             <div className="hidden lg:block text-left min-w-0">
//               <div className="font-medium truncate">AskAI</div>
//               <div className="text-sm text-zinc-400">Chat with AI</div>
//             </div>
//           </button>
//         )}
//       </div>

//       {/* Modals */}
//       <CreateGroupModal
//         isOpen={showCreateGroup}
//         onClose={() => setShowCreateGroup(false)}
//       />
//       <EditGroupModal
//         isOpen={Boolean(editingGroupId)}
//         onClose={closeEditGroupModal}
//         group={groups.find((g) => g._id === editingGroupId)}
//       />
//     </aside>
//   );
// };

// export default Sidebar;
