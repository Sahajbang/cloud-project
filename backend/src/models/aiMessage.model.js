// =========== One more attempt at defining the AI chat model ===========
import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isUser: { type: Boolean, required: true }, // true for user, false for AI
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const AiMessage = mongoose.model("AiMessage", aiMessageSchema);

export default AiMessage;


// import mongoose from "mongoose";

// const aiMessageSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     isUser: { type: Boolean, required: true }, // true for user, false for AI
//     text: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("AiMessage", aiMessageSchema);


// import mongoose from "mongoose";

// const aiChatSchema = new mongoose.Schema(
//   {
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: {
//       type: String,
//       required: true,
//     },
//     aiResponse: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const AIChat = mongoose.model("AIChat", aiChatSchema);

// export default AIChat;
