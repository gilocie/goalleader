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
  role: z.enum(['user', 'model', 'system']),
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
  const systemMessage = { role: 'system', content: 'Conversation start' };
  
  // Start with a system message.
  const history: Message[] = [systemMessage];

  // Add existing history if it's valid.
  if (Array.isArray(input.history)) {
    history.push(...input.history);
  }

  // Add the new user message.
  if (input.message) {
      history.push({ role: 'user', content: input.message });
  }

  const safeInput = {
    history,
    message: input.message || '',
  };
  return chatFlow(safeInput);
}

// --- Prompt Definition ---
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a helpful and encouraging AI assistant for GoalLeader. Your name is Goal Reader.
Your primary role is to help users manage their projects, tasks, and goals with a positive and supportive tone.

Here is the conversation history:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

New message from user:
- user: {{message}}

Your response:
- model:`,
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
      const { output } = await chatPrompt(input);

      // Force output to string with fallback
      const safeOutput =
        typeof output === 'string' && output.trim()
          ? output
          : "I'm sorry, I couldn't generate a response. Please try again.";

      return safeOutput;
    } catch (err) {
      console.error('ChatFlow error:', err);
      return "I'm sorry, an error occurred while processing your request. Please try again later.";
    }
  }
);
