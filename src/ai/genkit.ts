
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    '\n\nWARNING: GEMINI_API_KEY is not defined. Please add it to your .env file.\n\n'
  );
}

export const ai = genkit({
  plugins: [googleAI()],
});
