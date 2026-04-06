import React from 'react';
import GroupChatContainer from './GroupChatContainer';
import AiChatContainer from './AiChatContainer'; // ✅ Import AiChatContainer
import { useChatStore } from '../store/useChatStore';
import IndividualChatContainer from './IndividualChatContainer.';
const ChatContainer = () => {
  const selectedUser = useChatStore((state) => state.selectedUser);
  //console.log("Current Selection: ", selectedUser);
  const selectedGroup = useChatStore((state) => state.selectedGroup);

  const isAskAI = selectedUser?.fullName === 'AskAI'; // ✅ Detect AskAI
  const isUserSelected = !!selectedUser && !selectedGroup && !isAskAI;
  const isGroupSelected = !!selectedGroup && !selectedUser;

  return (
    <div className="h-full w-full flex flex-col">

      {/* Conditional rendering */}
      <div className="flex-1 overflow-y-auto">
        {isAskAI ? (
          <AiChatContainer />
        ) : isGroupSelected ? (
          <GroupChatContainer group={selectedGroup} />
        ) : (
          <div className="p-4 text-gray-500">
            Please select a user or a group to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;




// import React from 'react';
// import IndividualChatContainer from './IndividualChatContainer';
// import GroupChatContainer from './GroupChatContainer';
// import { useChatStore } from '../store/useChatStore';

// const ChatContainer = () => {
//   const selectedUser = useChatStore((state) => state.selectedUser);
//   const selectedGroup = useChatStore((state) => state.selectedGroup);
//   console.log("Selected group in ChatContainer:", selectedGroup);
//   console.log("ChatContainer rendered");
//   console.log("Selected user:", selectedUser);
//   console.log("Selected group:", selectedGroup);

//   return (
//     <div className="h-full w-full flex flex-col">
//       {/* Header
//       <div className="p-4 bg-gray-100 border-b text-lg font-semibold">
//         {selectedUser?.fullName || selectedGroup?.name || 'Select a User or Group'}
//       </div> */}

//       {/* Conditional rendering */}
//       <div className="flex-1 overflow-y-auto">
//         {selectedUser ? (
//           <IndividualChatContainer user={selectedUser} />
//         ) : selectedGroup ? (
//           <GroupChatContainer group={selectedGroup} />
//         ) : (
//           <div className="p-4 text-gray-500">Please select a user or a group to start chatting.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatContainer;


// import React, { useState } from 'react';
// import IndividualChatContainer from './IndividualChatContainer';
// import GroupChatContainer from './GroupChatContainer';
// import { useChatStore } from '../store/useChatStore'; // ✅ Correct default import

// const ChatContainer = () => {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const { user, group } = useChatStore(state => state); // Assume you have user and group in Zustand store

//   // Handle user/group selection
//   const handleUserSelect = (user) => {
//     setSelectedUser(user);
//     setSelectedGroup(null); // Reset group selection when selecting a user
//   };

//   const handleGroupSelect = (group) => {
//     setSelectedGroup(group);
//     setSelectedUser(null); // Reset user selection when selecting a group
//   };

//   return (
//     <div>
//       {/* Render user/group selection */}
//       <h2>{selectedUser ? selectedUser.fullName : selectedGroup ? selectedGroup.name : 'Select a User or Group'}</h2>

//       {/* Conditional rendering based on selection */}
//       {selectedUser ? (
//         <IndividualChatContainer user={selectedUser} />
//       ) : selectedGroup ? (
//         <GroupChatContainer group={selectedGroup} />
//       ) : (
//         <p>Please select a user or a group to start chatting.</p>
//       )}

//       {/* Optionally, add logic to display the user/group list for selection */}
//     </div>
//   );
// };

// export default ChatContainer;


// import { useChatStore } from "../store/useChatStore";
// import { shallow } from "zustand/shallow";
// import GroupChatContainer from "./GroupChatContainer";
// import IndividualChatContainer from "./IndividualChatContainer";

// const ChatContainer = () => {
//   const { selectedUser, selectedGroup, getMessages, unsubscribeFromMessages, subscribeToMessages } = useChatStore(
//     (state) => ({
//       selectedUser: state.selectedUser,
//       selectedGroup: state.selectedGroup,
//       getMessages: state.getMessages,
//       unsubscribeFromMessages: state.unsubscribeFromMessages,
//       subscribeToMessages: state.subscribeToMessages,
//     }),
//     shallow
//   );

//   console.log("selectedUser:", selectedUser);
//   console.log("selectedGroup:", selectedGroup);

//   // If a user is selected, fetch messages for that user
//   React.useEffect(() => {
//     if (selectedUser) {
//       getMessages(selectedUser._id, "individual");
//       subscribeToMessages(selectedUser._id, "individual");

//       // Unsubscribe from the previous user when switching to a new one
//       return () => {
//         unsubscribeFromMessages(selectedUser._id, "individual");
//       };
//     }

//     if (selectedGroup) {
//       getMessages(selectedGroup._id, "group");
//       subscribeToMessages(selectedGroup._id, "group");

//       // Unsubscribe from the previous group when switching to a new one
//       return () => {
//         unsubscribeFromMessages(selectedGroup._id, "group");
//       };
//     }
//   }, [selectedUser, selectedGroup, getMessages, unsubscribeFromMessages, subscribeToMessages]);

//   // Render chat components based on selected user or group
//   if (selectedUser) {
//     return <IndividualChatContainer />;
//   }

//   if (selectedGroup) {
//     return <GroupChatContainer />;
//   }

//   return (
//     <div className="flex-1 flex items-center justify-center">
//       <p>Please select a user or group to start messaging.</p>
//     </div>
//   );
// };

// export default ChatContainer;


// import { useChatStore } from "../store/useChatStore";
// import { shallow } from "zustand/shallow";
// import GroupChatContainer from "./GroupChatContainer";
// import IndividualChatContainer from "./IndividualChatContainer";

// const ChatContainer = () => {
//   const { selectedUser, selectedGroup } = useChatStore(
//     (state) => ({
//       selectedUser: state.selectedUser,
//       selectedGroup: state.selectedGroup,
//     }),
//     shallow
//   );
//   console.log("selectedUser:", selectedUser);
//   console.log("selectedGroup:", selectedGroup);

//   if (selectedUser) {
//     return <IndividualChatContainer />;
//   }

//   if (selectedGroup) {
//     return <GroupChatContainer />;
//   }

//   return (
//     <div className="flex-1 flex items-center justify-center">
//       <p>Please select a user or group to start messaging.</p>
//     </div>
//   );
// };

// export default ChatContainer;



// import { useChatStore } from "../store/useChatStore";
// import GroupChatContainer from "./GroupChatContainer";
// import IndividualChatContainer from "./IndividualChatContainer"; // Rename your old ChatContainer code to this

// const ChatContainer = () => {
//   const { selectedUser } = useChatStore();

//   if (!selectedUser) return null;

//   const isGroup = selectedUser.members !== undefined;

//   return isGroup ? <GroupChatContainer /> : <IndividualChatContainer />;
// };

// export default ChatContainer;
