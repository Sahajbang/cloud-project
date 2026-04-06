import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import axios from "axios";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import { Send, Loader2 } from "lucide-react";

const AiChatContainer = () => {
  const { authUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch existing AI messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log("[AIChat] Fetching previous messages...");
        const res = await axios.get("/api/chatbot", { withCredentials: true });
        const formattedMessages = res.data.map((msg) => ({
          senderId: msg.isUser ? authUser._id : "ai",
          text: msg.text,
          createdAt: msg.createdAt,
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Failed to fetch AI chat history:", err);
        setError("Unable to load previous chat.");
      }
    };
    fetchMessages();
  }, [authUser._id]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const userMessage = {
      senderId: authUser._id,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setLoading(true);
    setError(null);

    try {
      console.log("[AIChat] Sending text to backend:", text);

      // Send the message to the backend
      const response = await axios.post(
        "/api/chatbot",
        { text },
        { withCredentials: true }
      );

      console.log("[AIChat] Received AI response:", response.data);

      const aiMessage = {
        senderId: "ai",
        text: response.data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error getting AI response:", err);

      setMessages((prev) => [
        ...prev,
        {
          senderId: "ai",
          text: "⚠️ Sorry, I couldn't process your request.",
          createdAt: new Date().toISOString(),
        },
      ]);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader name="AskAI" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={msg.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : "/ai-avatar.png"}
                  alt="profile"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(msg.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img src="/ai-avatar.png" alt="AI" />
              </div>
            </div>
            <div className="chat-bubble flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500 text-center">{error}</div>}

        <div ref={messageEndRef} />
      </div>

      <div className="p-4 flex gap-2 border-t border-base-300">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your question..."
          className="input input-bordered w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="btn btn-sm btn-circle"
          onClick={handleSend}
          disabled={!text.trim() || loading}
          aria-label="Send message"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
};

export default AiChatContainer;


// import { useState, useRef, useEffect } from "react";
// import { useAuthStore } from "../store/useAuthStore";
// import axios from "axios";
// import { formatMessageTime } from "../lib/utils";
// import ChatHeader from "./ChatHeader";
// import { Send, Loader2 } from "lucide-react";

// const AiChatContainer = () => {
//   const { authUser } = useAuthStore();
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null); // ⬅️ for displaying errors
//   const messageEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Fetch existing AI messages
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         console.log("[AIChat] Fetching previous messages...");
//         const res = await axios.get("/api/chatbot", { withCredentials: true });
//         const formattedMessages = res.data.map((msg) => ({
//           senderId: msg.isUser ? authUser._id : "ai",
//           text: msg.text,
//           createdAt: msg.createdAt,
//         }));
//         setMessages(formattedMessages);
//       } catch (err) {
//         console.error("Failed to fetch AI chat history:", err);
//         setError("Unable to load previous chat.");
//       }
//     };
//     fetchMessages();
//   }, [authUser._id]);

//   const handleSend = async () => {
//     if (!text.trim()) return;

//     const userMessage = {
//       senderId: authUser._id,
//       text,
//       createdAt: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setText("");
//     setLoading(true);
//     setError(null);

//     try {
//       console.log("[AIChat] Sending prompt to backend:", text);

//       // 🔁 Updated: Backend expects { prompt } not { message }
//       const response = await axios.post(
//         "/api/chatbot",
//         { prompt: text }, // <-- backend expects `prompt`
//         { withCredentials: true }
//       );

//       console.log("[AIChat] Received AI response:", response.data);

//       const aiMessage = {
//         senderId: "ai",
//         text: response.data.reply, // <-- expected structure from backend
//         createdAt: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (err) {
//       console.error("Error getting AI response:", err);

//       setMessages((prev) => [
//         ...prev,
//         {
//           senderId: "ai",
//           text: "⚠️ Sorry, I couldn't process your request.",
//           createdAt: new Date().toISOString(),
//         },
//       ]);

//       // Optional: show detailed backend error message
//       if (err.response?.data?.error) {
//         setError(err.response.data.error);
//       } else {
//         setError("Something went wrong. Try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader name="AskAI" />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`chat ${
//               msg.senderId === authUser._id ? "chat-end" : "chat-start"
//             }`}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     msg.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : "/ai-avatar.png"
//                   }
//                   alt="profile"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(msg.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="chat chat-start">
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img src="/ai-avatar.png" alt="AI" />
//               </div>
//             </div>
//             <div className="chat-bubble flex items-center gap-2">
//               <Loader2 className="animate-spin" size={16} />
//               <span>Thinking...</span>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="text-sm text-red-500 text-center">{error}</div>
//         )}

//         <div ref={messageEndRef} />
//       </div>

//       <div className="p-4 flex gap-2 border-t border-base-300">
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Type your question..."
//           className="input input-bordered w-full"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button
//           className="btn btn-sm btn-circle"
//           onClick={handleSend}
//           disabled={!text.trim() || loading}
//           aria-label="Send message"
//         >
//           <Send size={22} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AiChatContainer;


// Working ai chat component that is not retained in the database

// import { useState, useRef, useEffect } from "react";
// import { useAuthStore } from "../store/useAuthStore";
// import axios from "axios";
// import { formatMessageTime } from "../lib/utils";
// import ChatHeader from "./ChatHeader";
// import { Send, Loader2 } from "lucide-react";

// const AiChatContainer = () => {
//   const { authUser } = useAuthStore();
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messageEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Fetch existing AI messages
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const res = await axios.get("/api/chatbot", { withCredentials: true });
//         const formattedMessages = res.data.map((msg) => ({
//           senderId: msg.isUser ? authUser._id : "ai",
//           text: msg.text,
//           createdAt: msg.createdAt,
//         }));
//         setMessages(formattedMessages);
//       } catch (err) {
//         console.error("Failed to fetch AI chat history", err);
//       }
//     };
//     fetchMessages();
//   }, [authUser._id]);

//   const handleSend = async () => {
//     if (!text.trim()) return;

//     const userMessage = {
//       senderId: authUser._id,
//       text,
//       createdAt: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setText("");
//     setLoading(true);

//     try {
//       const response = await axios.post(
//         "/api/chatbot",
//         { message: text },
//         { withCredentials: true }
//       );

//       // Change this to work with the object returned by the backend
//       const aiMessage = {
//         senderId: "ai",
//         text: response.data.reply, // <-- Use `reply` from the backend response
//         createdAt: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error getting AI response:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           senderId: "ai",
//           text: "Sorry, I couldn't process your request.",
//           createdAt: new Date().toISOString(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader name="AskAI" />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`chat ${
//               msg.senderId === authUser._id ? "chat-end" : "chat-start"
//             }`}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     msg.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : "/ai-avatar.png"
//                   }
//                   alt="profile"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(msg.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="chat chat-start">
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img src="/ai-avatar.png" alt="AI" />
//               </div>
//             </div>
//             <div className="chat-bubble flex items-center gap-2">
//               <Loader2 className="animate-spin" size={16} />
//               <span>Thinking...</span>
//             </div>
//           </div>
//         )}
//         <div ref={messageEndRef} />
//       </div>

//       <div className="p-4 flex gap-2 border-t border-base-300">
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Type your question..."
//           className="input input-bordered w-full"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button
//           className="btn btn-sm btn-circle"
//           onClick={handleSend}
//           disabled={!text.trim() || loading}
//           aria-label="Send message"
//         >
//           <Send size={22} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AiChatContainer;

// =============== Working Ai Chat but not retained ==========

// import { useState, useRef, useEffect } from "react";
// import { useAuthStore } from "../store/useAuthStore";
// import axios from "axios";
// import { formatMessageTime } from "../lib/utils";
// import ChatHeader from "./ChatHeader";
// import { Send } from "lucide-react";

// const AiChatContainer = () => {
//   const { authUser } = useAuthStore();
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const messageEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const handleSend = async () => {
//     if (!text.trim()) return;

//     const userMessage = {
//       senderId: authUser._id,
//       text,
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setText("");

//     try {
//       const response = await axios.post(
//         "/api/chatbot",
//         { message: text },
//         { withCredentials: true }
//       );

//       const aiMessage = {
//         senderId: "ai",
//         text: response.data.reply,
//         createdAt: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error getting AI response:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           senderId: "ai",
//           text: "Sorry, I couldn't process your request.",
//           createdAt: new Date().toISOString(),
//         },
//       ]);
//     }
//   };

//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader name="AskAI" />
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`chat ${
//               msg.senderId === authUser._id ? "chat-end" : "chat-start"
//             }`}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     msg.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : "/ai-avatar.png"
//                   }
//                   alt="profile"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(msg.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messageEndRef} />
//       </div>
//       <div className="p-4 flex gap-2 border-t border-base-300">
//         <input
//           ref={inputRef}
//           type="text"
//           placeholder="Type your question..."
//           className="input input-bordered w-full"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button
//           className="btn btn-sm btn-circle"
//           onClick={handleSend}
//           disabled={!text.trim() || loading}
//           aria-label="Send message"
//         >
//           <Send size={22} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AiChatContainer;

// import { useState, useRef, useEffect } from "react";
// import { useAuthStore } from "../store/useAuthStore";
// import axios from "axios";
// import { formatMessageTime } from "../lib/utils";
// import ChatHeader from "./ChatHeader";

// const AiChatContainer = () => {
//   const { authUser } = useAuthStore();
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const messageEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const handleSend = async () => {
//     if (!text.trim()) return;

//     const userMessage = {
//       senderId: authUser._id,
//       text,
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setText("");

//     try {
//       const response = await axios.post("/api/messages", userMessage);
//       //const response = await axios.post("/api/chatbot", { message: text });

//       const aiMessage = {
//         senderId: "ai",
//         text: response.data.reply, // fixed: changed from response.data.text to reply
//         createdAt: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error getting AI response:", error);
//       const errorMessage = {
//         senderId: "ai",
//         text: "Sorry, I couldn't process your request.",
//         createdAt: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     }
//   };

//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader name="AskAI" />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
//           >
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     msg.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : "/ai-avatar.png"
//                   }
//                   alt="profile"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(msg.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messageEndRef}></div>
//       </div>

//       <div className="p-4 flex gap-2 border-t border-base-300">
//         <input
//           type="text"
//           ref={inputRef}
//           placeholder="Type your question..."
//           className="input input-bordered w-full"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button className="btn btn-primary" onClick={handleSend}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AiChatContainer;
