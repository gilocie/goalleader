
// This file is NOT a server action module. It's for configuration.
// 'use server' was removed to allow exporting the 'ai' object.
import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// === Environment Debug ===
console.log('=== Environment Debug in genkit.ts ===');
console.log('All environment variables starting with GOOGLE or GEMINI:');
Object.keys(process.env)
  .filter(key => key.startsWith('GOOGLE') || key.startsWith('GEMINI'))
  .forEach(key => console.log(`${key}: ${process.env[key] ? `SET (starts with ${process.env[key]?.substring(0,4)}...)` : 'NOT SET'}`));
console.log('=======================================');


// Validate environment variables
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('Skipping Genkit initialization: Missing Google AI API key. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY in your .env or .env.local file.');
    return null;
  }
  
  console.log('Google AI API key found, initializing Genkit...');
  return apiKey;
};

// Initialize genkit with proper error handling
let ai: ReturnType<typeof genkit>;

const apiKey = getApiKey();

if (apiKey) {
    try {
      ai = genkit({
        plugins: [
          googleAI()
        ],
        logLevel: 'debug',
        enableTracingAndMetrics: true,
      });
      
      console.log('Genkit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Genkit:', error);
      // We don't re-throw here to allow the app to run without AI features.
    }
} else {
    // Create a mock 'ai' object if initialization is skipped.
    // This prevents the app from crashing when AI features are used.
    ai = {
        defineFlow: (config, impl) => {
            return async (input) => {
                console.warn(`Genkit is not initialized. Mock flow '${config.name}' was called.`);
                // Return a default error response that matches the expected schema type.
                // This is a generic handler; specific flows might need more tailored mock responses.
                if (config.outputSchema instanceof z.ZodString) {
                    return 'AI is not configured. Please add your Google AI API key to the .env file.';
                }
                return { error: 'AI is not configured.' };
            }
        },
        definePrompt: (config, impl) => {
             return async (input) => {
                console.warn(`Genkit is not initialized. Mock prompt '${config.name}' was called.`);
                return { output: 'AI is not configured. Please add your Google AI API key to the .env file.' };
            }
        },
    } as any;
}


export { ai };

// Export a function to test the connection
export async function testConnection() {
  if (!apiKey) {
    console.log('Connection test skipped: API key is missing.');
    return { success: false, error: 'API key is missing.' };
  }
  try {
    // Simple test to verify the setup works
    const testPrompt = ai.definePrompt({
      name: 'testPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: { schema: z.string() },
      output: { schema: z.string() },
      prompt: 'Say "Hello, World!" in response to: {{this}}',
    });
    
    const { output } = await testPrompt('test');
    console.log('Connection test successful:', output);
    return { success: true, result: output };
  } catch (error)
  {
    console.error('Connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
