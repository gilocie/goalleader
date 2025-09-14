
'use server';
/**
 * @fileOverview A flow to generate marketing content based on a topic.
 *
 * - generateMarketingContent - A function that generates marketing materials.
 * - GenerateMarketingContentInput - The input type for the function.
 * - GenerateMarketingContentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMarketingContentInputSchema = z.object({
  topic: z.string().describe('The topic or product to generate marketing content for.'),
});
export type GenerateMarketingContentInput = z.infer<typeof GenerateMarketingContentInputSchema>;

const SuggestionSchema = z.object({
    blogTitle: z.string().describe('A catchy title for a blog post about the topic.'),
    blogOutline: z.string().describe('A markdown-formatted outline for the blog post, including an introduction, 3 key points, and a conclusion.'),
    socialMediaPost: z.string().describe('An engaging social media post (e.g., for Twitter or LinkedIn) to promote the topic. Include relevant hashtags.'),
    emailSubject: z.string().describe('A compelling email subject line for a newsletter about the topic.'),
});

const GenerateMarketingContentOutputSchema = z.object({
    suggestions: z.array(SuggestionSchema).length(3).describe('An array of 3 distinct marketing content suggestions.')
});
export type GenerateMarketingContentOutput = z.infer<typeof GenerateMarketingContentOutputSchema>;


export async function generateMarketingContent(input: GenerateMarketingContentInput): Promise<GenerateMarketingContentOutput> {
  return generateMarketingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketingContentPrompt',
  input: { schema: GenerateMarketingContentInputSchema },
  output: { schema: GenerateMarketingContentOutputSchema },
  prompt: `You are a creative and effective marketing assistant. Your task is to generate 3 distinct sets of marketing materials for the following topic.

Each set should be professional, engaging, and tailored to attract customers. For each of the 3 suggestions, generate:
1.  A catchy and SEO-friendly blog post title.
2.  A structured blog post outline in markdown format. It should have an introduction, three main sections with bullet points, and a conclusion.
3.  A short and engaging social media post with relevant hashtags.
4.  A compelling email subject line that encourages opens.

Topic: {{topic}}
`,
});

const generateMarketingContentFlow = ai.defineFlow(
  {
    name: 'generateMarketingContentFlow',
    inputSchema: GenerateMarketingContentInputSchema,
    outputSchema: GenerateMarketingContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.suggestions) {
        throw new Error('Failed to generate marketing content. The model did not return a valid output.');
    }
    return output;
  }
);
