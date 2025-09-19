
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
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
      prompt: 'Say "Hello, World!" in response to: {{this}}',
    });

    // Make sure we're passing a valid string, not null
    const result = await testPrompt('test');
    
    // Check if result and result.output exist
    if (!result || typeof result.output !== 'string') {
      console.error('Invalid prompt result:', result);
      return { success: false, error: 'Invalid response from AI model' };
    }
    
    console.log('Connection test successful:', result.output);
    return { success: true, result: result.output };
  } catch (error) {
    console.error('Connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
