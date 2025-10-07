
'use server';

/**
 * Conversational chat flow for GoalLeader AI.
 * 
 * GoalLeader is not just reactive — it’s proactive: 
 * - Encourages KPI achievement 
 * - Tracks tasks and performance
 * - Offers motivational quotes & micro-articles
 * - Can suggest reflections during quiet periods
 * - Always responds in Markdown, enabling beautiful UI rendering
 */

import { ai } from '@/ai/genkit';
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
  performancePercentage: z.string(),
});

const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  tasks: z.array(TaskSchema).optional(),
  performance: PerformanceSchema.optional(),
  lastInteractionMinutesAgo: z.number().optional().describe(
    "How many minutes since the last staff message (used to trigger proactive nudges)."
  ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --------------------------
// Prompt
// --------------------------
const conversationalPrompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  system: `
You are **GoalLeader**, a proactive productivity coach and AI assistant.
You help staff stay focused, achieve their KPIs, and feel motivated — like a true human mentor.

💡 **Rules for responses:**
1. **Always reply in Markdown** for rich formatting (headings, bullet lists, blockquotes).
2. If performance context is provided:
   - Congratulate high performers (>80%).
   - Encourage struggling ones (<40%) and suggest practical next steps.
3. Reference **tasks** directly if provided (give advice on next priorities).
4. Occasionally share **short motivational quotes** inside > blockquotes.
5. Sometimes suggest a **tiny article snippet** (Markdown headings, bullets) with advice on productivity, teamwork, or resilience.
6. If **lastInteractionMinutesAgo > 20**, proactively check in with a friendly nudge like _"Hey, just checking in. Want to tackle the next step?"_.
7. Replies should be warm, concise, and human-like — not robotic.
`,
  prompt: `
---
**Staff context if available:**
{{#if performance}}
- Performance: Completed {{performance.completedTasks}} of {{performance.totalTasks}} tasks ({{performance.performancePercentage}}).
- Tasks:
{{#each tasks}}
  - {{name}} (Status: {{status}})
{{/each}}
{{else}}
- No performance data available.
{{/if}}
---

**User’s message:** {{message}}

Please provide your **assistant reply** below as Markdown:
  `,
});

// --------------------------
// Flow
// --------------------------
const chatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await conversationalPrompt(input);
    return output!;
  }
);

// --------------------------
// Public Helper
// --------------------------
export async function runChat(input: ChatInput): Promise<string> {
  const result = await chatFlow(input);
  return result.reply;
}

// --------------------------
// Self Test
// --------------------------
export async function testChatSetup(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const testResult = await runChat({
      message: 'Quick hello',
      lastInteractionMinutesAgo: 25,
    });

    const isError = testResult.toLowerCase().includes('error');
    return {
      success: !isError,
      message: isError ? 'Chat setup test failed' : 'Chat setup test passed',
      details: { testResult, isError },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Chat setup test threw exception',
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}
