
'use server';
/**
 * @fileOverview A safe chat flow for GoalReader AI.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type.
 * - ChatOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Schema Definitions ---
const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  content: z.string(),
});
type Message = z.infer<typeof MessageSchema>;

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).optional().default([]), // Made optional with default
  message: z.string().min(1), // Added minimum length validation
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --- Prompt Definition (moved before usage) ---
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

Please provide a helpful response:`,
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
      // Validate input
      const validatedInput = ChatInputSchema.parse(input);
      
      // Prepare conversation history
      const history: Message[] = [
        { role: 'system', content: 'You are Goal Reader, an AI assistant helping users manage their goals and tasks.' }
      ];

      // Add validated history
      if (validatedInput.history && Array.isArray(validatedInput.history)) {
        history.push(...validatedInput.history.filter(m => 
          m && 
          typeof m === 'object' && 
          m.role && 
          m.content &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
        ));
      }

      // Add current message
      if (validatedInput.message && validatedInput.message.trim()) {
        history.push({ role: 'user', content: validatedInput.message.trim() });
      }

      // Generate response
      const result = await chatPrompt({
        history,
        message: validatedInput.message
      });

      // Validate and return output
      if (result && result.output && typeof result.output === 'string') {
        const trimmedOutput = result.output.trim();
        return trimmedOutput || "Hello! I'm Goal Reader. How can I help you achieve your goals today?";
      }

      return "Hello! I'm Goal Reader. How can I help you achieve your goals today?";

    } catch (err) {
      console.error('ChatFlow error:', err);
      
      // More specific error handling
      if (err instanceof z.ZodError) {
        console.error('Validation error:', err.errors);
        return "I received invalid input. Please check your message and try again.";
      }
      
      return "I'm sorry, an error occurred while processing your request. Please try again later.";
    }
  }
);

// --- Main chat function ---
export async function chat(input: ChatInput): Promise<ChatOutput> {
  try {
    // Validate input first
    if (!input) {
      throw new Error('Input is required');
    }

    if (!input.message || typeof input.message !== 'string' || !input.message.trim()) {
      return "Please provide a message to get started!";
    }

    // Ensure history is properly formatted
    const cleanHistory = Array.isArray(input.history) 
      ? input.history.filter(m => 
          m && 
          typeof m === 'object' && 
          m.role && 
          m.content && 
          typeof m.content === 'string'
        )
      : [];

    const cleanInput: ChatInput = {
      history: cleanHistory,
      message: input.message.trim()
    };

    return await chatFlow(cleanInput);

  } catch (err) {
    console.error("Chat function error:", err);
    
    // Return user-friendly error message
    return "I'm having trouble processing your request right now. Please try again in a moment.";
  }
}
