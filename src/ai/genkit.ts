
/**
 * genkit.ts
 *
 * Centralized Genkit + GoogleAI initialization.
 */
import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
});

export async function testConnection() {
  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: 'Say "Hello, World!"',
    });
    const resultText = output?.text;
    console.log('✅ Connection test succeeded:', resultText);
    return { success: true, result: resultText };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
