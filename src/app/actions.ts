"use server";

import { convertToDocx } from "@/ai/flows/convert-to-docx";
import { convertToPdf } from "@/ai/flows/convert-to-pdf";
import { mergeCharterPartyContract } from "@/ai/flows/merge-charter-party-contract";

interface ContractInputs {
  fixtureRecap: string;
  baseContract: string;
  negotiatedClauses: string;
}

export async function generateContract(inputs: ContractInputs) {
  try {
    // Merge the contract
    const mergedResult = await mergeCharterPartyContract({
      fixtureRecap: inputs.fixtureRecap,
      baseContract: inputs.baseContract,
      negotiatedClauses: inputs.negotiatedClauses,
    });

    if (!mergedResult?.mergedContract) {
      console.error("AI merge failed, no contract returned.", mergedResult.warnings);
      throw new Error("AI failed to merge the contract. The model may be overloaded. Please try again later.");
    }

    return {
      ...mergedResult,
      risks: [],
      consistencyFindings: [],
      redlinedContract: "",
      recommendations: { clauses: [] },
    };
  } catch (error) {
    console.error("Error during contract generation:", error);
    // Re-throw the error to be caught by the client
    throw error;
  }
}

export async function downloadDocx(htmlContent: string) {
  try {
    return await convertToDocx({ htmlContent });
  } catch (error) {
    console.error("Error during DOCX conversion:", error);
    throw error;
  }
}

export async function downloadPdf(htmlContent: string) {
  try {
    const { pdfBase64 } = await convertToPdf({ htmlContent });
    return { pdfBase64 };
  } catch (error) {
    console.error("Error during PDF conversion:", error);
    throw error;
  }
}

export async function sendEmail(contractData: {
  cleanContract: string;
  redlinedContract: string;
  recipientEmail: string;
  subject: string;
}) {
  try {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log("Sending email to:", contractData.recipientEmail);
    console.log("Subject:", contractData.subject);

    // For demo purposes, return success
    return { success: true, messageId: "demo-message-id" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}



