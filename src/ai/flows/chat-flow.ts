
'use server';
/**
 * @fileOverview A flow to generate marketing content, adapted for chat testing.
 *
 * - chat - A function that generates marketing materials.
 * - ChatInput - The input type for the function.
 * - ChatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Input is a simple string from the user
const ChatInputSchema = z.string();
export type ChatInput = z.infer<typeof ChatInputSchema>;

// We'll define a simple string output for the chat response
const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


// The schema for the AI model's full output
const MarketingContentOutputSchema = z.object({
    suggestions: z.array(z.object({
        blogTitle: z.string(),
    })).length(3),
});


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return generateMarketingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketingContentForChatPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: z.object({ topic: z.string() }) },
  output: { schema: MarketingContentOutputSchema },
  prompt: `You are a creative and effective marketing assistant. 
Your task is to generate 3 distinct blog post titles for the following topic.
Return only the blog titles.

Topic: {{topic}}
`,
});

const generateMarketingContentFlow = ai.defineFlow(
  {
    name: 'generateMarketingContentForChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (topic) => {
    const { output } = await prompt({ topic });
    if (!output?.suggestions || output.suggestions.length === 0) {
        throw new Error('Failed to generate marketing content. The model did not return a valid output.');
    }
    // Return just the first blog title as a string to match our ChatOutputSchema
    return output.suggestions[0].blogTitle;
  }
);
