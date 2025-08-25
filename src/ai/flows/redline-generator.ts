'use server';

/**
 * @fileOverview AI flow to generate redlined contract versions showing changes.
 *
 * - generateRedline - A function that creates redlined versions showing differences.
 * - GenerateRedlineInput - The input type for the generateRedline function.
 * - GenerateRedlineOutput - The return type for the generateRedline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRedlineInputSchema = z.object({
  baseContract: z
    .string()
    .describe('The original base contract template.'),
  negotiatedClauses: z
    .string()
    .describe('The negotiated clauses to be merged.'),
  mergedContract: z
    .string()
    .describe('The final merged contract for comparison.'),
});

export type GenerateRedlineInput = z.infer<typeof GenerateRedlineInputSchema>;

const RedlineChangeSchema = z.object({
  changeId: z.string().describe('Unique identifier for the change.'),
  type: z.enum(['added', 'removed', 'modified']).describe('Type of change made.'),
  section: z.string().describe('Section of the contract where change occurred.'),
  originalText: z.string().optional().describe('Original text (for removed/modified).'),
  newText: z.string().optional().describe('New text (for added/modified).'),
  description: z.string().describe('Description of what changed.'),
  impact: z.enum(['high', 'medium', 'low']).describe('Impact level of the change.'),
});

const GenerateRedlineOutputSchema = z.object({
  redlinedContract: z.string().describe('HTML contract with redline markup showing changes.'),
  changes: z.array(RedlineChangeSchema).describe('Array of all changes made.'),
  summary: z.string().describe('Summary of changes and their impact.'),
  changeStats: z.object({
    added: z.number().describe('Number of additions.'),
    removed: z.number().describe('Number of removals.'),
    modified: z.number().describe('Number of modifications.'),
    total: z.number().describe('Total number of changes.'),
  }).describe('Statistics of changes made.'),
});

export type GenerateRedlineOutput = z.infer<typeof GenerateRedlineOutputSchema>;

export async function generateRedline(input: GenerateRedlineInput): Promise<GenerateRedlineOutput> {
  return generateRedlineFlow(input);
}

const generateRedlinePrompt = ai.definePrompt({
  name: 'generateRedlinePrompt',
  input: {schema: GenerateRedlineInputSchema},
  output: {schema: GenerateRedlineOutputSchema},
  prompt: `You are a contract redlining expert. Create a redlined version of the contract showing all changes between the base contract and negotiated clauses.

Inputs:
1) Base Contract: {{{baseContract}}}
2) Negotiated Clauses: {{{negotiatedClauses}}}
3) Merged Contract: {{{mergedContract}}}

Your task is to:
1. Compare the base contract with the final merged contract
2. Identify all additions, removals, and modifications
3. Create an HTML version with proper redline markup:
   - Green highlighting for additions
   - Red strikethrough for removals  
   - Yellow highlighting for modifications
4. Provide detailed change tracking with impact assessment
5. Generate change statistics

Use HTML markup for redlining:
- <span style="background-color: #d4edda; color: #155724;">text</span> for additions (green)
- <span style="background-color: #f8d7da; color: #721c24; text-decoration: line-through;">text</span> for removals (red)
- <span style="background-color: #fff3cd; color: #856404;">text</span> for modifications (yellow)

For each change:
- Identify the specific section and clause
- Describe what was changed and why it matters
- Assess the commercial/legal impact
- Provide clear before/after text

Return a comprehensive redlined contract with detailed change tracking.`,
  system: `You are a contract redlining expert with extensive experience in maritime law and charter party contracts. You understand the importance of tracking changes for legal compliance and commercial clarity.`
});

const generateRedlineFlow = ai.defineFlow(
  {
    name: 'generateRedlineFlow',
    inputSchema: GenerateRedlineInputSchema,
    outputSchema: GenerateRedlineOutputSchema,
  },
  async input => {
    const {output} = await generateRedlinePrompt(input);
    return output!;
  }
);

