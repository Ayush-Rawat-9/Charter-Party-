'use server';

/**
 * @fileOverview AI flow to analyze fixture recap and recommend additional clauses.
 *
 * - recommendClauses - A function that analyzes fixture recap and suggests relevant clauses.
 * - RecommendClausesInput - The input type for the recommendClauses function.
 * - RecommendClausesOutput - The return type for the recommendClauses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendClausesInputSchema = z.object({
  fixtureRecap: z
    .string()
    .describe('The fixture recap containing commercial terms and voyage details.'),
  baseContract: z
    .string()
    .describe('The base contract template to understand existing clause coverage.'),
});

export type RecommendClausesInput = z.infer<typeof RecommendClausesInputSchema>;

const RecommendedClauseSchema = z.object({
  clauseId: z.string().describe('Unique identifier for the clause.'),
  category: z.enum(['commercial', 'legal', 'operational', 'insurance', 'arbitration', 'force_majeure']).describe('Category of the clause.'),
  title: z.string().describe('Short title of the recommended clause.'),
  description: z.string().describe('Detailed description of why this clause is recommended.'),
  priority: z.enum(['high', 'medium', 'low']).describe('Priority level of the recommendation.'),
  clauseText: z.string().describe('The actual clause text to be inserted.'),
  reasoning: z.string().describe('AI reasoning for why this clause is needed.'),
});

const RecommendClausesOutputSchema = z.object({
  recommendedClauses: z.array(RecommendedClauseSchema).describe('Array of recommended clauses.'),
  summary: z.string().describe('Summary of recommendations and coverage analysis.'),
  coverageScore: z.number().min(0).max(100).describe('Overall coverage score based on existing vs recommended clauses.'),
});

export type RecommendClausesOutput = z.infer<typeof RecommendClausesOutputSchema>;

export async function recommendClauses(input: RecommendClausesInput): Promise<RecommendClausesOutput> {
  return recommendClausesFlow(input);
}

const recommendClausesPrompt = ai.definePrompt({
  name: 'recommendClausesPrompt',
  input: {schema: RecommendClausesInputSchema},
  output: {schema: RecommendClausesOutputSchema},
  prompt: `You are an expert maritime lawyer specializing in Charter Party Contracts. Analyze the provided fixture recap and base contract to recommend additional clauses that should be included for comprehensive coverage.

Inputs:
1) Fixture Recap: {{{fixtureRecap}}}
2) Base Contract: {{{baseContract}}}

Your task is to:
1. Analyze the commercial terms, cargo type, voyage details, and existing clauses
2. Identify gaps in coverage that could lead to disputes or legal issues
3. Recommend specific clauses with full text that should be added
4. Provide reasoning for each recommendation
5. Calculate a coverage score (0-100) based on completeness

Common clause categories to consider:
- Commercial: Payment terms, demurrage/despatch, laytime calculations
- Legal: Governing law, jurisdiction, arbitration, dispute resolution
- Operational: Bunkering, deviation, sub-chartering, agency
- Insurance: P&I coverage, hull insurance, cargo insurance
- Force Majeure: Pandemic, war, sanctions, natural disasters
- Special: Dangerous cargo, ice clauses, environmental compliance

For each recommendation, provide:
- Clear reasoning based on the specific voyage/cargo details
- Complete clause text ready for insertion
- Priority level based on risk assessment
- Category for proper organization

Return a comprehensive analysis with actionable recommendations.`,
  system: `You are an expert maritime lawyer with 20+ years experience in Charter Party Contracts. You understand the commercial, legal, and operational risks in shipping and can identify gaps in contract coverage.`
});

const recommendClausesFlow = ai.defineFlow(
  {
    name: 'recommendClausesFlow',
    inputSchema: RecommendClausesInputSchema,
    outputSchema: RecommendClausesOutputSchema,
  },
  async input => {
    const {output} = await recommendClausesPrompt(input);
    return output!;
  }
);

