'use server';
/**
 * @fileOverview A flow to merge fixture recap, base contract, and negotiated clauses into a validated Charter Party Contract.
 *
 * - mergeCharterPartyContract - A function that handles the contract merging process.
 * - MergeCharterPartyContractInput - The input type for the mergeCharterPartyContract function.
 * - MergeCharterPartyContractOutput - The return type for the mergeCharterPartyContract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MergeCharterPartyContractInputSchema = z.object({
  baseContract: z
    .string()
    .describe('The base Charter Party Contract template (normalized text or structured HTML).'),
  fixtureRecap: z
    .string()
    .describe('The fixture recap details (key/value facts and narrative).'),
  negotiatedClauses: z
    .string()
    .describe('The negotiated clauses (section-tagged text).'),
});
export type MergeCharterPartyContractInput = z.infer<typeof MergeCharterPartyContractInputSchema>;

const MergeCharterPartyContractOutputSchema = z.object({
  mergedContract: z
    .string()
    .describe('The merged Charter Party Contract in HTML format.'),
  warnings: z.array(z.string()).describe('Any warnings or conflicts detected during the merging process.'),
});
export type MergeCharterPartyContractOutput = z.infer<typeof MergeCharterPartyContractOutputSchema>;

export async function mergeCharterPartyContract(input: MergeCharterPartyContractInput): Promise<MergeCharterPartyContractOutput> {
  return mergeCharterPartyContractFlow(input);
}

const mergeCharterPartyContractPrompt = ai.definePrompt({
  name: 'mergeCharterPartyContractPrompt',
  input: {schema: MergeCharterPartyContractInputSchema},
  output: {schema: MergeCharterPartyContractOutputSchema},
  prompt: `You are a contract automation assistant. Generate a final Charter Party Contract (a shipping agreement between a shipowner and a charterer) by integrating the provided Base Contract Template, Fixture Recap details, and Negotiated Clauses. Preserve the legal formatting, numbering, cross-references, and formal tone.

Inputs:
1) Base Contract Template: {{{baseContract}}}
2) Fixture Recap: {{{fixtureRecap}}}
3) Negotiated Clauses: {{{negotiatedClauses}}}

Rules:
- Keep the Base Contract’s original structure and numbering.
- Insert Fixture Recap terms into their appropriate sections.
- Merge Negotiated Clauses into the correct positions; do not lose mandatory terms.
- Ensure consistent defined terms and references (e.g., Vessel, Charterer).
- If conflicts are detected, retain the most recent Negotiated Clause and log a warning.
- Return clean, well-structured HTML suitable for Word/PDF conversion.
- Do NOT use the acronym 'CP'. Always use 'Charter Party Contract'.`,
  system: `You are a contract automation assistant. Generate a final Charter Party Contract (a shipping agreement between a shipowner and a charterer) by integrating the provided Base Contract Template, Fixture Recap details, and Negotiated Clauses. Preserve the legal formatting, numbering, cross-references, and formal tone.`
});

const mergeCharterPartyContractFlow = ai.defineFlow(
  {
    name: 'mergeCharterPartyContractFlow',
    inputSchema: MergeCharterPartyContractInputSchema,
    outputSchema: MergeCharterPartyContractOutputSchema,
  },
  async input => {
    const {output} = await mergeCharterPartyContractPrompt(input);
    return output!;
  }
);
