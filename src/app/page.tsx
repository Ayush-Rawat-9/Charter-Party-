"use client";

import { useState } from "react";
import type { z } from "zod";
import { FileText, Loader2, Download, Mail } from "lucide-react";

import { AppHeader } from "@/components/app/Header";
import { InputForm, type FormValues } from "@/components/app/InputForm";
import { ContractPreview } from "@/components/app/ContractPreview";


import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/use-toast";

import { generateContract } from "./actions";
import type { MergeCharterPartyContractOutput } from "@/ai/flows/merge-charter-party-contract";


type GenerationOutput = MergeCharterPartyContractOutput & {
  risks: any[];
  consistencyFindings: any[];
  redlinedContract: string;
  recommendations: { clauses: any[] };
};

export default function Home() {
  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedContractContent, setEditedContractContent] = useState<string>("");

  const { toast } = useToast();

  const handleGenerate = async (data: FormValues) => {
    setIsGenerating(true);
    setOutput(null);
    setEditedContractContent("");
    try {
      const result = await generateContract(data);
      if (!result) {
        throw new Error("The AI failed to generate a response. Please try again.");
      }
      setOutput(result);
      toast({
        title: "Contract Generated",
        description: "The contract has been successfully merged and analyzed.",
      });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };











  const handleContentChange = (editedContent: string) => {
    setEditedContractContent(editedContent);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent("Charter Party Contract");
    const contractContent = editedContractContent || output?.mergedContract || "";
    // Convert HTML to a readable plain-text email body
    const textBody = htmlToPlainText(contractContent);
    // mailto URLs can be limited by client/OS; keep it reasonable
    const MAX_LEN = 8000;
    const bodyTrimmed = textBody.length > MAX_LEN ? `${textBody.slice(0, MAX_LEN)}\n\n...[truncated]` : textBody;
    const body = encodeURIComponent(bodyTrimmed);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  function htmlToPlainText(html: string): string {
    // Remove scripts/styles
    const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    // Replace breaks and paragraphs with newlines
    const withLineBreaks = withoutScripts
      .replace(/<\/(p|div|h\d)>/gi, '\n')
      .replace(/<br\s*\/?\s*>/gi, '\n');
    // Strip all remaining tags
    const stripped = withLineBreaks.replace(/<[^>]+>/g, '');
    // Decode basic HTML entities
    const decoded = stripped
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    // Normalize whitespace
    return decoded.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
  }



  return (
    <div className="flex flex-col h-full bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">


          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Input Form */}
            <div className="w-1/2 relative h-full overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Contract Input</h2>
              </div>



              <InputForm onSubmit={handleGenerate} isGenerating={isGenerating} />
            </div>

            {/* Output Panels */}
            <div className="w-1/2 h-full overflow-y-auto bg-white/50 dark:bg-black/10 p-4 md:p-6 lg:p-8 border-l">
              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {isGenerating ? (
                  <LoadingState />
                ) : output ? (
                  <>
                    {/* Contract Actions */}
                    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                      <Button size="sm" variant="outline" onClick={handleSendEmail}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>

                    {/* Contract Preview */}
                    <div className="mt-4">
                      <ContractPreview
                        htmlContent={output.mergedContract}
                        warnings={output.warnings}
                        onContentChange={handleContentChange}
                      />
                    </div>
                  </>
                ) : (
                  <InitialState />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const InitialState = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 rounded-lg border-2 border-dashed">
    <div className="p-4 bg-primary/10 rounded-full mb-4">
      <FileText className="w-10 h-10 text-primary" />
    </div>
    <h2 className="text-xl font-semibold text-primary/90">Your Contract Appears Here</h2>
    <p className="text-muted-foreground mt-2 max-w-sm">
      Fill in the fixture recap, base contract, and negotiated clauses on the left, then click "Generate Contract" to create your merged contract.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-8">
    <div>
      <Skeleton className="h-8 w-1/3 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
    <div>
      <Skeleton className="h-8 w-1/2 mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);
