import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Pencil, Trash2 } from "lucide-react";

const GroupChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedGroup,
    setSelectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (selectedGroup?._id) {
      getMessages(selectedGroup._id, "group");
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedGroup?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEdit = async (messageId) => {
    if (!editText.trim()) return;
    await editMessage(messageId, editText, true); // true for group message
    setEditingMessage(null);
    setEditText("");
  };

  const handleDelete = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId, true); // true for group message
    }
  };

  const Message = ({ message }) => {
    if (!message || !message.senderId) {
      return null;
    }

    const isSentByMe = message.senderId._id === authUser?._id;
    const [showActions, setShowActions] = useState(false);

    return (
      <div
        className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-4`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`flex ${isSentByMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[75%]`}>
          <img
            src={message.senderId.profilePic || "default-avatar.png"}
            alt={message.senderId.fullName || "User"}
            className="size-8 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className={`text-xs text-zinc-500 mb-1 ${isSentByMe ? "text-right" : "text-left"}`}>
              {isSentByMe ? "You" : (message.senderId.fullName || "Unknown User")}
            </span>
            <div className="flex items-end gap-2">
              {isSentByMe && showActions && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      setEditingMessage(message._id);
                      setEditText(message.text);
                    }}
                    className="p-1 hover:bg-base-200 rounded-full transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="p-1 hover:bg-base-200 rounded-full transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {editingMessage === message._id ? (
                <div className="flex gap-2 items-center bg-base-200 rounded-lg p-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input input-sm input-bordered flex-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEdit(message._id)}
                    className="btn btn-sm btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setEditText("");
                    }}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  className={`rounded-lg p-2 break-words ${isSentByMe
                      ? "bg-neutral text-neutral-content"
                      : "bg-base-200"
                    }`}
                >
                  {message.text}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Message attachment"
                      className="max-w-sm rounded-lg mt-2"
                    />
                  )}
                  <div
                    className={`text-xs mt-1 ${isSentByMe ? "text-neutral-content/80" : "text-base-content/50"
                      }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Group Chat! 👋</h2>
          <p className="text-zinc-500">Select a group to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          messages?.filter(msg => msg && msg._id).map((message) => (
            <Message key={message._id} message={message} />
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default GroupChatContainer;