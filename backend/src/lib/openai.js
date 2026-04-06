import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Make sure your .env contains OPENAI_API_KEY
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Send messages to the OpenAI chat completion API and return the assistant's text.
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<string>}
 */
export async function askAI(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages array is required");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
    });

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error("No reply from OpenAI");
    }

    return reply.trim();
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    throw new Error("Failed to get response from OpenAI");
  }
}