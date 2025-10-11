
import { z } from 'zod';

export const SuggestionSchema = z.object({
    id: z.string().optional(),
    blogTitle: z.string().describe('A catchy title for a blog post about the topic.'),
    blogOutline: z.string().describe('A markdown-formatted outline for the blog post, including an introduction, 3 key points, and a conclusion.'),
    socialMediaPost: z.string().describe('An engaging social media post (e.g., for Twitter or LinkedIn) to promote the topic. Include relevant hashtags.'),
    emailSubject: z.string().describe('A compelling email subject line for a newsletter about the topic.'),
    // Add optional fields for scheduling
    scheduledAt: z.string().optional(),
    recipients: z.array(z.string()).optional(),
    approvedAt: z.string().optional(),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
