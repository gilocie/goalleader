
'use server';
/**
 * @fileOverview A safe chat flow for GoalReader AI.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type.
 * - ChatOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Schema Definitions ---
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --- Main chat function ---
export async function chat(input: ChatInput): Promise<ChatOutput> {
  const safeInput = {
    history: Array.isArray(input.history) ? input.history : [],
    message: typeof input.message === 'string' ? input.message : "",
  };
  return chatFlow(safeInput);
}

// --- Prompt Definition ---
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a helpful AI assistant for GoalLeader. Your name is Goal Reader.
You help users with their projects, tasks, and goals.

Here is the chat history:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

New message from user:
{{message}}`,
});

// --- Flow Definition ---
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      // Run the prompt safely
      const { output } = await chatPrompt(input);

      // Ensure output is always a string
      const safeOutput =
        output && typeof output === 'string' && output.trim()
          ? output
          : "I'm sorry, I couldn't generate a response. Please try again.";

      return safeOutput;
    } catch (err) {
      console.error("ChatFlow error:", err);
      return "I'm sorry, I couldn't generate a response. Please try again.";
    }
  }
);
