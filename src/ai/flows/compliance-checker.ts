'use server';

/**
 * @fileOverview AI flow to check compliance with mandatory charter party clauses.
 *
 * - checkCompliance - A function that verifies presence of mandatory clauses.
 * - CheckComplianceInput - The input type for the checkCompliance function.
 * - CheckComplianceOutput - The return type for the checkCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckComplianceInputSchema = z.object({
  contractText: z
    .string()
    .describe('The complete text of the Charter Party Contract to analyze.'),
  fixtureRecap: z
    .string()
    .describe('The fixture recap to understand the specific voyage requirements.'),
});

export type CheckComplianceInput = z.infer<typeof CheckComplianceInputSchema>;

const ComplianceItemSchema = z.object({
  itemId: z.string().describe('Unique identifier for the compliance item.'),
  category: z.enum(['commercial', 'legal', 'operational']).describe('Category of the compliance item.'),
  requirement: z.string().describe('The mandatory requirement being checked.'),
  status: z.enum(['present', 'missing', 'incomplete', 'conflicting']).describe('Status of the requirement.'),
  description: z.string().describe('Detailed description of the requirement.'),
  impact: z.enum(['critical', 'high', 'medium', 'low']).describe('Impact level if missing.'),
  suggestion: z.string().describe('Suggestion for addressing the compliance issue.'),
  location: z.string().optional().describe('Where in the contract this item was found or should be added.'),
});

const ComplianceScoreSchema = z.object({
  overall: z.number().min(0).max(100).describe('Overall compliance score (0-100).'),
  commercial: z.number().min(0).max(100).describe('Commercial compliance score (0-100).'),
  legal: z.number().min(0).max(100).describe('Legal compliance score (0-100).'),
  operational: z.number().min(0).max(100).describe('Operational compliance score (0-100).'),
});

const CheckComplianceOutputSchema = z.object({
  complianceItems: z.array(ComplianceItemSchema).describe('Array of compliance check items.'),
  scores: ComplianceScoreSchema.describe('Compliance scores by category.'),
  summary: z.string().describe('Overall compliance summary and recommendations.'),
  criticalIssues: z.array(z.string()).describe('List of critical compliance issues that must be addressed.'),
  recommendations: z.array(z.string()).describe('Specific recommendations for improving compliance.'),
});

export type CheckComplianceOutput = z.infer<typeof CheckComplianceOutputSchema>;

export async function checkCompliance(input: CheckComplianceInput): Promise<CheckComplianceOutput> {
  return checkComplianceFlow(input);
}

const checkCompliancePrompt = ai.definePrompt({
  name: 'checkCompliancePrompt',
  input: {schema: CheckComplianceInputSchema},
  output: {schema: CheckComplianceOutputSchema},
  prompt: `You are a maritime compliance expert specializing in Charter Party Contract requirements. Analyze the provided contract against mandatory compliance standards.

Inputs:
1) Contract Text: {{{contractText}}}
2) Fixture Recap: {{{fixtureRecap}}}

Your task is to verify compliance with mandatory charter party clauses across three categories:

COMMERCIAL COMPLIANCE:
- Vessel identification and specifications
- Cargo description and quantity
- Loading/discharge ports and laycan
- Freight rate and payment terms
- Demurrage/despatch provisions
- Laytime calculations and notice requirements

LEGAL COMPLIANCE:
- Governing law and jurisdiction
- Arbitration and dispute resolution
- Force majeure provisions
- Liability and indemnity clauses
- Insurance requirements
- Termination and cancellation rights

OPERATIONAL COMPLIANCE:
- Notice of readiness (NOR) procedures
- Bunkering and deviation rights
- Sub-chartering permissions
- Agency and port operations
- Documentation requirements
- Environmental and safety standards

For each compliance item:
1. Check if the requirement is present, missing, incomplete, or conflicting
2. Assess the impact level (critical, high, medium, low)
3. Provide specific suggestions for addressing issues
4. Note the location in the contract where found or should be added

Calculate scores (0-100) for each category and overall compliance.
Identify critical issues that must be addressed before contract execution.

Return a comprehensive compliance analysis with actionable recommendations.`,
  system: `You are a maritime compliance expert with deep knowledge of international shipping regulations, charter party standards, and industry best practices. You understand the legal and commercial risks of non-compliance.`
});

const checkComplianceFlow = ai.defineFlow(
  {
    name: 'checkComplianceFlow',
    inputSchema: CheckComplianceInputSchema,
    outputSchema: CheckComplianceOutputSchema,
  },
  async input => {
    const {output} = await checkCompliancePrompt(input);
    return output!;
  }
);

