/**
 * genkit.ts
 *
 * Centralized Genkit + GoogleAI initialization, with defensive logging and
 * graceful fallback if API keys or plugin setup are missing.
 */

import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// -----------------------
//  ENVIRONMENT VALIDATION
// -----------------------

/**
 * We prefer GOOGLE_AI_API_KEY (official standard),
 * but also allow GEMINI_API_KEY for developer convenience.
 */
const apiKey =
  process.env.GOOGLE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY;

// Quick trace for debugging — only prints short prefix of API key
console.log('=== Genkit Environment Check ===');
console.log(
  apiKey
    ? `✔ API key detected (starts with: ${apiKey.substring(0, 5)}...)`
    : '❌ No API key found! Please set GOOGLE_AI_API_KEY in your .env.local'
);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================================');
  
// -----------------------
//   GENKIT INITIALIZATION
// -----------------------

let ai: ReturnType<typeof genkit>;

/**
 * If we have a valid API key, initialize the GoogleAI plugin.
 * The plugin reads API keys directly from process.env (not from an argument).
 */
if (apiKey) {
  try {
    ai = genkit({
      plugins: [
        googleAI() // 🚨 Do not pass apiKey directly, environment handles this
      ],
    });
    console.log('✅ Genkit initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Genkit:', error);
    ai = createMockAI();
  }
} else {
  ai = createMockAI();
}

// -----------------------
//   FALLBACK MOCK (safe for dev without key)
// -----------------------
function createMockAI() {
  console.warn('⚠️ Using Mock AI: No Google AI API key present');

  return {
    defineFlow: (config: any, impl: any) => {
      return async (input: any) => {
        console.warn(
          `Mock flow called: '${config.name}' (AI not configured)`
        );
        return 'AI features are not configured. Please add your Google AI API key to your .env.local file.';
      };
    },
    definePrompt: (config: any) => {
      return async (input: any) => {
        console.warn(
          `Mock prompt called: '${config.name}' (AI not configured)`
        );
        return {
          output:
            'AI features are not configured. Please add your Google AI API key to your .env.local file.',
        };
      };
    },
  } as any;
}

// -----------------------
//   CONNECTION TEST HELPER
// -----------------------

export async function testConnection() {
  if (!apiKey) {
    console.log('Connection test skipped: API key is missing.');
    return { success: false, error: 'API key is missing' };
  }

  try {
    const testPrompt = ai.definePrompt({
      name: 'testPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: { schema: z.string() },
      output: { schema: z.string() },
      config: {
        temperature: 0.3,
        maxOutputTokens: 50,
      },
      prompt: 'Say "Hello, World!" in response to: {{this}}',
    });

    const result = await testPrompt('test');
    if (!result || typeof result.output !== 'string') {
      throw new Error('Invalid model response: ' + JSON.stringify(result));
    }

    console.log('✅ Connection test succeeded:', result.output);
    return { success: true, result: result.output };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export { ai };