// ======== One more attempt at defining the AI chat controller ===========
import AiMessage from "../models/aiMessage.model.js";
import { askAI } from "../lib/openai.js"; // Make sure this is a valid abstraction to OpenAI

// GET: Fetch all AI messages for the logged-in user
export const getAiMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await AiMessage.find({ userId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getAiMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Send a user message and get AI response
export const sendAiMessage = async (req, res) => {
  console.log("📥 Received body:", req.body);
  const { text } = req.body;
  console.log("🔍 Type of text:", typeof text);
  
  const userId = req.user._id;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text must be a non-empty string" });
  }

  try {
    // Save the user message
    const userMessage = new AiMessage({
      userId,
      isUser: true,
      text,
    });
    await userMessage.save();

    // Fetch previous messages to build the conversation context
    const previousMessages = await AiMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10); // Limit to last 10 messages for context

    // Format messages for OpenAI's chat completion API
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text
    }));

    // Add system message for context
    formattedMessages.unshift({
      role: "system",
      content: "You are a helpful AI assistant. Be concise and clear in your responses."
    });

    // Get AI response
    const aiResponseText = await askAI(formattedMessages);

    // Save AI's response
    const aiMessage = new AiMessage({
      userId,
      isUser: false,
      text: aiResponseText,
    });
    await aiMessage.save();

    res.status(201).json({ reply: aiResponseText });
  } catch (error) {
    console.error("❌ Error in sendAiMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// import AiMessage from "../models/aiMessage.model.js";
// import { askAI } from "../lib/openai.js"; // You should implement this helper to communicate with OpenAI

// export const getAiMessages = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const messages = await AiMessage.find({ userId });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("Error in getAiMessages: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const sendAiMessage = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { text } = req.body;

//     if (!text || text.trim() === "") {
//       return res.status(400).json({ error: "Message text is required" });
//     }

//     const userMessage = new AiMessage({
//       userId,
//       isUser: true,
//       text,
//     });

//     await userMessage.save();

//     const aiResponseText = await askAI(text); // Calls OpenAI and returns the response text

//     const aiMessage = new AiMessage({
//       userId,
//       isUser: false,
//       text: aiResponseText,
//     });

//     await aiMessage.save();

//     res.status(201).json([userMessage, aiMessage]);
//   } catch (error) {
//     console.error("Error in sendAiMessage: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
