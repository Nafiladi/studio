// A Genkit flow to improve an animation prompt using GenAI.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImprovePromptInputSchema = z.object({
  prompt: z.string().describe('The original text prompt for animation generation.'),
});
export type ImprovePromptInput = z.infer<typeof ImprovePromptInputSchema>;

const ImprovePromptOutputSchema = z.object({
  improvedPrompt: z.string().describe('The improved text prompt suggested by GenAI.'),
});
export type ImprovePromptOutput = z.infer<typeof ImprovePromptOutputSchema>;

export async function improveAnimationPrompt(input: ImprovePromptInput): Promise<ImprovePromptOutput> {
  return improvePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The original text prompt for animation generation.'),
    }),
  },
  output: {
    schema: z.object({
      improvedPrompt: z.string().describe('The improved text prompt suggested by GenAI.'),
    }),
  },
  prompt: `You are an AI prompt enhancer for animation generation. Given the following prompt, suggest an improved prompt that would generate a better animation.\n\nOriginal Prompt: {{{prompt}}}\n\nImproved Prompt:`,
});

const improvePromptFlow = ai.defineFlow<
  typeof ImprovePromptInputSchema,
  typeof ImprovePromptOutputSchema
>({
  name: 'improvePromptFlow',
  inputSchema: ImprovePromptInputSchema,
  outputSchema: ImprovePromptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
