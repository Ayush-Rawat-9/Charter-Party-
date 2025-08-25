'use server';

/**
 * @fileOverview Clause Risk Analyzer AI agent.
 *
 * - analyzeClauseRisk - A function that handles the clause risk analysis process.
 * - AnalyzeClauseRiskInput - The input type for the analyzeClauseRisk function.
 * - AnalyzeClauseRiskOutput - The return type for the analyzeClauseRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeClauseRiskInputSchema = z.object({
  contractText: z
    .string()
    .describe('The complete text of the merged Charter Party Contract.'),
});
export type AnalyzeClauseRiskInput = z.infer<typeof AnalyzeClauseRiskInputSchema>;

const RiskSchema = z.object({
  sectionId: z.string().describe('The section ID of the contract where the risk is located.'),
  severity: z
    .enum(['high', 'medium', 'low'])
    .describe('The severity of the risk (high, medium, or low).'),
  note: z.string().describe('A detailed description of the risk or inconsistency.'),
  suggestion: z.string().describe('A suggested redline or action to address the risk.'),
});

const AnalyzeClauseRiskOutputSchema = z.object({
  risks: z.array(RiskSchema).describe('An array of identified risks, conflicts, and inconsistencies in the contract.'),
  consistencyFindings: z
    .array(z.string())
    .describe('Any additional findings related to the consistency of the contract.'),
});

export type AnalyzeClauseRiskOutput = z.infer<typeof AnalyzeClauseRiskOutputSchema>;

export async function analyzeClauseRisk(input: AnalyzeClauseRiskInput): Promise<AnalyzeClauseRiskOutput> {
  return analyzeClauseRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeClauseRiskPrompt',
  input: {schema: AnalyzeClauseRiskInputSchema},
  output: {schema: AnalyzeClauseRiskOutputSchema},
  prompt: `You are an expert legal contract analyst specializing in identifying risks, conflicts, and inconsistencies in Charter Party Contracts (shipping agreements).

You will analyze the provided Charter Party Contract text and identify any potential issues.

Return an array of risks, conflicts, and inconsistencies found in the contract, along with a severity level (high, medium, or low), a detailed description of the issue, and a suggested redline or action to address the risk. Also return any additional consistency findings.

Charter Party Contract Text:
{{{contractText}}}`, 
});

const analyzeClauseRiskFlow = ai.defineFlow(
  {
    name: 'analyzeClauseRiskFlow',
    inputSchema: AnalyzeClauseRiskInputSchema,
    outputSchema: AnalyzeClauseRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
