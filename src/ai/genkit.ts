import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Get API key
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

// Initialize genkit
let ai: ReturnType<typeof genkit>;

if (apiKey) {
    try {
      ai = genkit({
        plugins: [
          googleAI({ apiKey }) // ← PASS THE API KEY HERE
        ],
        logLevel: 'debug',
        enableTracingAndMetrics: true,
      });
      
      console.log('Genkit initialized successfully with API key');
    } catch (error) {
      console.error('Failed to initialize Genkit:', error);
      // Create mock ai object on initialization failure
      ai = createMockAI();
    }
} else {
    console.warn('Google AI API key not found. Using mock AI implementation.');
    ai = createMockAI();
}

// Helper function for mock AI
function createMockAI() {
  return {
    defineFlow: (config: any, impl: any) => {
      return async (input: any) => {
        console.warn(`Genkit is not initialized. Mock flow '${config.name}' was called.`);
        return 'AI is not configured. Please add your Google AI API key to the .env file.';
      };
    },
    definePrompt: (config: any) => {
      return async (input: any) => {
        console.warn(`Genkit is not initialized. Mock prompt '${config.name}' was called.`);
        return { output: 'AI is not configured. Please add your Google AI API key to the .env file.' };
      };
    },
  } as any;
}

export { ai };

// Test connection function
export async function testConnection() {
  if (!apiKey) {
    return { success: false, error: 'API key is missing.' };
  }
  
  try {
    const testPrompt = ai.definePrompt({
      name: 'testPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: { schema: z.string() },
      output: { schema: z.string() },
      prompt: 'Say "Hello, World!" in response to: {{this}}',
    });
    
    const { output } = await testPrompt('test');
    return { success: true, result: output };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
