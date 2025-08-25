'use server';

/**
 * @fileOverview AI flow to explain risks and benefits of specific clauses.
 *
 * - explainClauseRisk - A function that analyzes a specific clause and explains its implications.
 * - ExplainClauseRiskInput - The input type for the explainClauseRisk function.
 * - ExplainClauseRiskOutput - The return type for the explainClauseRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainClauseRiskInputSchema = z.object({
  contractText: z
    .string()
    .describe('The complete text of the Charter Party Contract for context.'),
  clauseText: z
    .string()
    .describe('The specific clause text to be analyzed and explained.'),
  clauseId: z
    .string()
    .describe('Unique identifier for the clause being analyzed.'),
  clauseCategory: z
    .enum(['commercial', 'legal', 'operational', 'insurance', 'arbitration', 'force_majeure'])
    .describe('Category of the clause for context.'),
});

export type ExplainClauseRiskInput = z.infer<typeof ExplainClauseRiskInputSchema>;

const ExplainClauseRiskOutputSchema = z.object({
  explanation: z
    .string()
    .describe('Plain-language explanation of the clause\'s risks and benefits.'),
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('Assessed risk level of the clause.'),
  benefits: z
    .array(z.string())
    .describe('List of benefits this clause provides.'),
  risks: z
    .array(z.string())
    .describe('List of potential risks or concerns with this clause.'),
  recommendations: z
    .array(z.string())
    .describe('Specific recommendations for this clause.'),
  legalImplications: z
    .string()
    .describe('Brief explanation of legal implications.'),
});

export type ExplainClauseRiskOutput = z.infer<typeof ExplainClauseRiskOutputSchema>;

export async function explainClauseRisk(input: ExplainClauseRiskInput): Promise<ExplainClauseRiskOutput> {
  return explainClauseRiskFlow(input);
}

const explainClauseRiskPrompt = ai.definePrompt({
  name: 'explainClauseRiskPrompt',
  input: {schema: ExplainClauseRiskInputSchema},
  output: {schema: ExplainClauseRiskOutputSchema},
  prompt: `You are an expert maritime lawyer specializing in Charter Party Contracts. Analyze the provided clause within the context of the full contract and explain its implications in plain language.

Inputs:
1) Contract Text: {{{contractText}}}
2) Clause Text: {{{clauseText}}}
3) Clause ID: {{{clauseId}}}
4) Clause Category: {{{clauseCategory}}}

Your task is to:
1. Analyze the specific clause within the context of the entire contract
2. Identify potential risks and benefits
3. Provide clear, plain-language explanations
4. Assess the overall risk level
5. Give actionable recommendations

Focus on:
- How this clause affects the commercial relationship
- Legal implications and enforceability
- Potential for disputes or misunderstandings
- Alignment with industry standards
- Impact on other contract sections

Provide explanations that would be understandable to:
- Shipowners and charterers
- Legal professionals
- Insurance brokers
- Maritime professionals

Return a comprehensive analysis with clear, actionable insights.`,
  system: `You are an expert maritime lawyer with 20+ years experience in Charter Party Contracts. You understand both the legal and commercial implications of contract clauses and can explain complex legal concepts in plain language.`
});

const explainClauseRiskFlow = ai.defineFlow(
  {
    name: 'explainClauseRiskFlow',
    inputSchema: ExplainClauseRiskInputSchema,
    outputSchema: ExplainClauseRiskOutputSchema,
  },
  async input => {
    const {output} = await explainClauseRiskPrompt(input);
    return output!;
  }
);

