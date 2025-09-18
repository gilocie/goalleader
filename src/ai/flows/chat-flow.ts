
'use server';
/**
 * @fileOverview A simplified chat flow for GoalReader AI for debugging.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type.
 * - ChatOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// --- Schema Definitions ---
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
type Message = z.infer<typeof MessageSchema>;

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).optional().default([]),
  message: z.string().min(1),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --- Main chat function ---
export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Use a simple prompt for basic conversation
  const simpleChat = ai.prompt(
    `You are a helpful assistant. Continue the conversation.

{{#each history}}
- {{role}}: {{content}}
{{/each}}
- user: {{message}}
`
  );

  try {
    const result = await simpleChat({
      ...input,
      model: googleAI.model('gemini-1.5-flash'),
    });
    return result.text;
  } catch (err) {
    console.error('Simplified Chat error:', err);
    return "I'm sorry, an error occurred while processing your request. Please try again later.";
  }
}
