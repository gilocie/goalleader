
/**
 * genkit.ts
 *
 * Centralized Genkit + GoogleAI initialization, with defensive logging and
 * graceful fallback if API keys or plugin setup are missing.
 */

import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { GEMINI_MODEL } from '@/lib/ai-models';

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
 * We pass the apiKey explicitly to avoid environment variable conflicts.
 */
if (apiKey) {
  try {
    ai = genkit({
      plugins: [
        googleAI({ apiKey })
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
        if (config.outputSchema) {
          const schema = config.outputSchema;
          if (schema instanceof z.ZodObject) {
            const shape = schema.shape as z.ZodRawShape;
            const mockOutput: Record<string, any> = {};
            for (const key in shape) {
                mockOutput[key] = `AI is not configured. Add API Key.`;
            }
            return mockOutput;
          }
        }
        return 'AI features are not configured. Please add your Google AI API key to your .env.local file.';
      };
    },
    definePrompt: (config: any) => {
      return async (input: any) => {
        console.warn(
          `Mock prompt called: '${config.name}' (AI not configured)`
        );
        const mockOutput = 'AI features are not configured. Please add your Google AI API key to your .env.local file.';
        
        if (config.output?.schema instanceof z.ZodObject) {
            const shape = config.output.schema.shape as z.ZodRawShape;
            const mockObject: Record<string, any> = {};
            for (const key in shape) {
                mockObject[key] = mockOutput;
            }
            return { output: mockObject };
        }

        return {
          output: mockOutput
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
    const { output } = await ai.generate({
      model: GEMINI_MODEL,
      prompt: 'Say "Hello, World!"',
      config: {
        temperature: 0.3,
        maxOutputTokens: 50,
      },
    });

    const resultText = output?.text;
    if (!resultText) {
      throw new Error('Invalid model response: ' + JSON.stringify(output));
    }

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

export { ai };
