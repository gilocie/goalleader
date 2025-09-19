
'use server';

/**
 * Conversational chat flow for GoalLeader AI with defensive validation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// --------------------------
// Schemas
// --------------------------

const TaskSchema = z.object({
  name: z.string(),
  status: z.string(),
});

const PerformanceSchema = z.object({
  completedTasks: z.number(),
  totalTasks: z.number(),
  performancePercentage: z.number(),
});


const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  tasks: z.array(TaskSchema).optional(),
  performance: PerformanceSchema.optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --------------------------
// Prompt (defined ONCE)
// --------------------------
const conversationalPrompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  model: googleAI.model('models/gemini-1.5-flash'),
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  config: {
    temperature: 0.8,
    maxOutputTokens: 1000,
  },
  prompt: `You are GoalLeader, an expert productivity coach and AI assistant. 
Your tone is helpful, encouraging, and friendly.

You are in a conversation with a user. Use the context provided below to make your responses more personal and proactive.

CONTEXT:
{{#if performance}}
- User's Performance: Completed {{performance.completedTasks}} of {{performance.totalTasks}} tasks ({{performance.performancePercentage}}%).
- The user has the following tasks:
  {{#each tasks}}
  - {{name}} (Status: {{status}})
  {{/each}}
{{else}}
- No performance data available.
{{/if}}

INSTRUCTIONS:
1.  Respond naturally to the user's message like a human coach.
2.  If the user's performance is excellent (over 80%), congratulate them and ask if they need help with their remaining tasks.
3.  If the user's performance is low (under 40%), be encouraging. Ask if they are feeling stuck and offer to help break down a task.
4.  If the conversation feels right, occasionally include a short, relevant motivational quote.
5.  Keep your replies concise and helpful.

User's message: {{message}}
Reply:`,
});

// --------------------------
// Flow (just like marketing flow)
// --------------------------
const chatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await conversationalPrompt(input);

    if (!output?.reply || typeof output.reply !== 'string') {
      throw new Error('Model did not return a valid reply.');
    }

    return { reply: output.reply.trim() };
  }
);

// --------------------------
// Public helper
// --------------------------
export async function runChat(input: ChatInput): Promise<string> {
  console.log('=== runChat called ===');

  try {
    const parsed = ChatInputSchema.safeParse(input);

    if (!parsed.success) {
      console.error('Input validation failed:', parsed.error);
      return "I'm sorry — I couldn't read that message. Please send plain text.";
    }

    const result = await chatFlow(parsed.data);
    return result.reply;
  } catch (err) {
    console.error('=== runChat error ===', err);

    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('authentication'))
        return "Authentication error: Please check your Google AI API key configuration.";
      if (msg.includes('quota') || msg.includes('rate limit'))
        return "Rate limit exceeded. Please try again later.";
      if (msg.includes('network') || msg.includes('fetch'))
        return "Network error: Please check your internet connection and try again.";
    }

    return "I'm sorry, an internal error occurred while processing your request. Please try again.";
  }
}

// --------------------------
// Setup Self-test
// --------------------------
export async function testChatSetup(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const testResult = await runChat({ message: 'Hello, this is a test message' });

    const isError = testResult.toLowerCase().includes('error');
    return {
      success: !isError,
      message: isError
        ? 'Chat setup test failed - got error response'
        : 'Chat setup test passed',
      details: { testResult, isError },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Chat setup test failed with exception',
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}
