// A Genkit flow to generate an animation from a text prompt.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnimationInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an animation from.'),
});
export type GenerateAnimationInput = z.infer<typeof GenerateAnimationInputSchema>;

const GenerateAnimationOutputSchema = z.object({
  animationDataUri: z.string().describe('The animation as a data URI.'),
});
export type GenerateAnimationOutput = z.infer<typeof GenerateAnimationOutputSchema>;

export async function generateAnimation(input: GenerateAnimationInput): Promise<GenerateAnimationOutput> {
  return generateAnimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnimationPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The text prompt to generate an animation from.'),
    }),
  },
  output: {
    schema: z.object({
      animationDataUri: z.string().describe('The animation as a data URI.'),
    }),
  },
  prompt: `Generate an animation data URI based on the following prompt:\n\nPrompt: {{{prompt}}}`,
});

const generateAnimationFlow = ai.defineFlow<
  typeof GenerateAnimationInputSchema,
  typeof GenerateAnimationOutputSchema
>({
  name: 'generateAnimationFlow',
  inputSchema: GenerateAnimationInputSchema,
  outputSchema: GenerateAnimationOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
