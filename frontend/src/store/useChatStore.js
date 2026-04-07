import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { showNotification } from "../lib/notifications.js";

export const useChatStore = create((set, get) => {
  let isSubscribed = false;

  // Try to load persisted unread messages
  const persistedUnreadMessages = JSON.parse(localStorage.getItem('unreadMessages') || '{}');
  console.log("[useChatStore] Loading persisted unread messages:", persistedUnreadMessages);

  return {
    messages: [],
    users: [],
    groups: [],
    selectedUser: null,
    selectedGroup: null,
    isUsersLoading: false,
    isGroupsLoading: false,
    isMessagesLoading: false,
    authUser: null,

    unreadMessages: persistedUnreadMessages,

    setAuthUser: (user) => {
      set({ authUser: user });
    },

    addUnreadMessage: (chatId, message) => {
      console.log("[addUnreadMessage] Adding unread message for", chatId, message);
      set((state) => {
        const existing = state.unreadMessages[chatId] || [];
        const newState = {
          unreadMessages: {
            ...state.unreadMessages,
            [chatId]: [...existing, message],
          },
        };
        console.log("[addUnreadMessage] New unread messages state:", newState.unreadMessages);
        // Persist the updated unread messages
        localStorage.setItem('unreadMessages', JSON.stringify(newState.unreadMessages));
        return newState;
      });
    },

    clearUnreadMessage: (chatId) => {
      //console.log("[clearUnreadMessage] Clearing unread messages for", chatId);
      //console.log("[clearUnreadMessage] Current unread messages:", get().unreadMessages);
      set((state) => {
        const updated = { ...state.unreadMessages };
        delete updated[chatId];
        //console.log("[clearUnreadMessage] Updated unread messages:", updated);
        // Persist the updated unread messages
        localStorage.setItem('unreadMessages', JSON.stringify(updated));
        return { unreadMessages: updated };
      });
    },

    hasUnreadMessage: (chatId) => {
      const unread = get().unreadMessages;
      const hasUnread = Array.isArray(unread[chatId]) && unread[chatId].length > 0;
      //console.log("[hasUnreadMessage] Checking unread for", chatId, "Result:", hasUnread, "State:", unread);
      return hasUnread;
    },

    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        set({ isUsersLoading: false });
      }
    },

    getGroups: async () => {
      set({ isGroupsLoading: true });
      try {
        const res = await axiosInstance.get("/groups");
        set({ groups: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load groups");
      } finally {
        set({ isGroupsLoading: false });
      }
    },

    getMessages: async (id, type = "individual") => {
      if (!id) return;
      set({ isMessagesLoading: true });

      try {
        let endpoint;
        if (id === "askai") {
          endpoint = "/ai/messages";
        } else {
          endpoint = type === "group"
            ? `/groups/${id}/messages`
            : `/messages/${id}`;
        }
        const res = await axiosInstance.get(endpoint);
        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load messages");
      } finally {
        set({ isMessagesLoading: false });
      }
    },

    sendMessage: async (messageData) => {
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      try {
        let res;
        if (selectedUser._id === "askai") {
          res = await axiosInstance.post("/ai/messages", messageData);
        } else {
          res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          // Update local messages immediately for better UX
          set({ messages: [...messages, res.data] });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },

    sendGroupMessage: async (messageData) => {
      const { selectedGroup, messages } = get();
      if (!selectedGroup) return;
      try {
        const res = await axiosInstance.post(
          `/groups/${selectedGroup._id}/messages`,
          messageData
        );
        set({ messages: [...messages, res.data] });
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to send group message"
        );
      }
    },

    editMessage: async (messageId, text, isGroup = false) => {
      try {
        const endpoint = isGroup
          ? `/groups/messages/${messageId}`
          : `/messages/${messageId}`;

        const res = await axiosInstance.put(endpoint, { text });

        // Update local messages
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? { ...msg, text } : msg
          ),
        }));

        toast.success("Message updated successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to edit message");
      }
    },

    deleteMessage: async (messageId, isGroup = false) => {
      try {
        const endpoint = isGroup
          ? `/groups/messages/${messageId}`
          : `/messages/${messageId}`;

        await axiosInstance.delete(endpoint);

        // Update local messages
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));

        toast.success("Message deleted successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete message");
      }
    },

    subscribeToMessages: () => {
      if (isSubscribed) {
        console.log("[subscribeToMessages] Already subscribed");
        return;
      }

      const { socket, authUser } = useAuthStore.getState();
      if (!socket || !authUser) {
        console.log("[subscribeToMessages] No socket or auth user");
        return;
      }

      console.log("[subscribeToMessages] Setting up socket listeners");

      socket.on("newMessage", (newMessage) => {
        console.log("[Socket] Received new message:", newMessage);
        const { selectedUser, selectedGroup, messages, authUser } = get();

        // Check if we should show this message (either sender or receiver is current user)
        const isRelevantToUser = newMessage.senderId === authUser?._id || newMessage.receiverId === authUser?._id;
        if (!isRelevantToUser) return;

        console.log("[Socket] Current state:", {
          selectedUser,
          authUser,
          newMessageSender: newMessage.senderId,
          newMessageReceiver: newMessage.receiverId,
          currentUnreadMessages: get().unreadMessages
        });

        // Check if this chat is currently open for either sender or receiver
        const isChatOpen = selectedUser && (
          (authUser._id === newMessage.receiverId && selectedUser._id === newMessage.senderId) ||
          (authUser._id === newMessage.senderId && selectedUser._id === newMessage.receiverId)
        ) && !selectedGroup;

        // If chat is open, update messages array regardless of who sent it
        if (isChatOpen) {
          console.log("[Socket] Chat is open, adding to messages");
          set({ messages: [...messages, newMessage] });
          return;
        }

        // If this is a message from the current user, don't mark as unread
        if (newMessage.senderId === authUser?._id) {
          console.log("[Socket] Message is from current user, skipping unread state");
          return;
        }

        // Otherwise, mark as unread for the recipient
        console.log("[Socket] Chat is not open, marking as unread");
        const chatId = newMessage.senderId;
        get().addUnreadMessage(chatId, newMessage);

        try {
          showNotification(
            newMessage.senderName || "New Message",
            newMessage.text
          );
        } catch (error) {
          console.log("[Socket] Could not show notification:", error);
        }
      });

      socket.on("newGroupMessage", (newMessage) => {
        console.log("[Socket] Received new group message:", newMessage);
        const { selectedGroup, selectedUser, messages } = get();
        const isGroupOpen =
          selectedGroup &&
          selectedGroup._id === newMessage.groupId &&
          !selectedUser;

        if (isGroupOpen) {
          console.log("[Socket] Group chat is open, adding to messages");
          set({ messages: [...messages, newMessage] });
        } else {
          console.log("[Socket] Group chat is not open, marking as unread");
          get().addUnreadMessage(newMessage.groupId, newMessage);

          try {
            showNotification(
              `${newMessage.senderName} in ${newMessage.groupName}`,
              newMessage.text
            );
          } catch (error) {
            console.log("[Socket] Could not show notification:", error);
          }
        }
      });

      // Add handlers for message updates and deletions
      socket.on("messageUpdate", ({ messageId, text }) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? { ...msg, text } : msg
          ),
        }));
      });

      socket.on("messageDelete", ({ messageId }) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      });

      socket.on("groupMessageUpdate", ({ messageId, message }) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? message : msg
          ),
        }));
      });

      socket.on("groupMessageDelete", ({ messageId }) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      });

      isSubscribed = true;
      console.log("[subscribeToMessages] Successfully subscribed to messages");
    },

    unsubscribeFromMessages: () => {
      const { socket } = useAuthStore.getState();
      if (!socket) {
        console.log("[unsubscribeFromMessages] No socket to disconnect");
        return;
      }
      socket.off("newMessage");
      socket.off("newGroupMessage");
      isSubscribed = false;
      console.log("[unsubscribeFromMessages] Unsubscribed from messages");
    },

    setSelectedUser: async (user) => {
      const { selectedUser, unsubscribeFromMessages, subscribeToMessages, clearUnreadMessage } = get();

      // If selecting the same user, do nothing
      if (selectedUser?._id === user?._id) return;

      console.log("[setSelectedUser] Setting selected user:", user?._id);

      // Clear previous selection and messages
      set({ selectedUser: user, selectedGroup: null, messages: [] });

      // Don't proceed with message loading for AskAI
      if (user?._id === "askai") return;

      // Clear unread messages for this chat partner
      console.log("[setSelectedUser] Clearing unread messages for chat partner:", user?._id);
      clearUnreadMessage(user?._id);

      // Reset socket subscription and load messages
      unsubscribeFromMessages();
      await get().getMessages(user._id, "individual");
      subscribeToMessages();
    },

    setSelectedGroup: async (group) => {
      const { unsubscribeFromMessages, subscribeToMessages, clearUnreadMessage } = get();

      if (!group) {
        set({ selectedGroup: null, messages: [] });
        return;
      }

      set({ selectedGroup: group, selectedUser: null, messages: [] });
      clearUnreadMessage(group._id);

      unsubscribeFromMessages();
      await get().getMessages(group._id, "group");
      subscribeToMessages();
    },

    createGroup: async (groupName, userIds, groupPic) => {
      try {
        const currentUser = useAuthStore.getState().authUser;
        if (!currentUser || !currentUser._id) {
          throw new Error("User not logged in");
        }

        const allMemberIds = Array.from(new Set([...userIds, currentUser._id]));

        const res = await axiosInstance.post("/groups/create", {
          name: groupName,
          memberIds: allMemberIds,
          groupPic,
        });

        toast.success("Group created successfully!");
        get().getGroups();
      } catch (err) {
        console.error("Error creating group:", err);
        toast.error(err.response?.data?.message || "Failed to create group");
      }
    },

    editGroup: async (groupId, newName, newMemberIds, groupPic) => {
      try {
        const res = await axiosInstance.put(`/groups/${groupId}`, {
          name: newName,
          memberIds: newMemberIds,
          groupPic,
        });

        toast.success("Group updated successfully!");
        get().getGroups();
      } catch (err) {
        console.error("Error updating group:", err);
        toast.error(err.response?.data?.message || "Failed to update group");
      }
    },

    deleteGroup: async (groupId) => {
      try {
        await axiosInstance.delete(`/groups/${groupId}`);
        toast.success("Group deleted successfully!");
        get().setSelectedGroup(null);
        get().getGroups();
      } catch (err) {
        console.error("Error deleting group:", err);
        toast.error(err.response?.data?.message || "Failed to delete group");
      }
    },
  };
});