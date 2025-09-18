
'use server';
/**
 * @fileOverview A safe chat flow for GoalReader AI.
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
  history: z.array(MessageSchema).optional().default([]), // Made optional with default
  message: z.string().min(1), // Added minimum length validation
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --- Prompt Definition ---
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  model: googleAI.model('gemini-1.5-flash'),
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
  // New conversation history mapping
  history: (input) => {
    // Add a system message to set the AI's persona
    const history: Message[] = [
        { role: 'model', content: 'You are Goal Reader, an AI assistant helping users manage their goals and tasks.' }
    ];
    // Add the user's provided history
    if (input.history) {
        history.push(...input.history);
    }
    return history;
  }
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
      
      // Generate response
      const result = await chatPrompt({
        ...validatedInput,
        // Pass the new message to the prompt, which will append it after the history
        message: validatedInput.message
      });

      // Validate and return output
      const output = result.output;
      if (output && typeof output === 'string' && output.trim()) {
        return output.trim();
      }
      
      // If we are here, something went wrong with the AI generation.
      throw new Error('AI failed to generate a valid response.');

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
    if (!input || !input.message || typeof input.message !== 'string' || !input.message.trim()) {
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
