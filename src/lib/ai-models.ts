
/**
 * @fileOverview Centralized AI model definitions for Genkit.
 *
 * This file exports a constant for the primary Gemini model used throughout the application.
 * Using a constant ensures consistency and makes it easy to update the model in one place.
 */

import { googleAI } from '@genkit-ai/google-genai';

/**
 * The primary, stable Gemini model used for most generative tasks.
 * Using 'gemini-1.5-flash-latest' provides a balance of speed and capability.
 */
export const GEMINI_MODEL = googleAI('gemini-1.5-flash-latest');
