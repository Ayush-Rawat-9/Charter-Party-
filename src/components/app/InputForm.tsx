"use client";

import { useId, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, UploadCloud, Wand2 } from "lucide-react";
import mammoth from "mammoth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fixtureRecap: z.string().min(10, {
    message: "Fixture recap must be at least 10 characters.",
  }),
  baseContract: z.string().min(10, {
    message: "Base contract must be at least 10 characters.",
  }),
  negotiatedClauses: z.string().min(10, {
    message: "Negotiated clauses must be at least 10 characters.",
  }),
});

export type FormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  onSubmit: (values: FormValues) => void;
  isGenerating: boolean;
}

const defaultValues = {
  fixtureRecap: `Vessel: "MV GENKIT EXPLORER"
Charterer: "Global Freight Logistics"
Owner: "Oceanic Carriers Inc."
Laycan: "2024-08-01 / 2024-08-10"
Load Port: "Port of Singapore"
Discharge Port: "Port of Rotterdam"
Freight Rate: "$25.00 per metric ton"
Cargo: "50,000 metric tons of iron ore"`,
  baseContract: `<!DOCTYPE html>
<html>
<head>
  <title>Base Charter Party Contract</title>
</head>
<body>
  <h1>Standard Charter Party Contract</h1>
  <section>
    <h2>1. Vessel Identification</h2>
    <p>This Charter Party Contract is entered into between the Owner, [Owner Name], and the Charterer, [Charterer Name], for the vessel named [Vessel Name].</p>
  </section>
  <section>
    <h2>2. Voyage and Cargo</h2>
    <p>The vessel shall proceed to [Load Port] to load a cargo of [Cargo Details] and shall thereafter proceed to [Discharge Port].</p>
    <p>Laycan for arrival at load port is [Laycan Start Date] to [Laycan End Date].</p>
  </section>
  <section>
    <h2>3. Freight Payment</h2>
    <p>Freight shall be paid at a rate of [Freight Rate].</p>
  </section>
  <section>
    <h2>4. Demurrage and Despatch</h2>
    <p>Demurrage rate is set at $15,000 per day. Despatch rate is half of demurrage.</p>
  </section>
</body>
</html>`,
  negotiatedClauses: `Section 2: Voyage and Cargo
The vessel is permitted to take on bunkers at a port en route to the discharge port, provided it does not unreasonably deviate from the customary route.

Section 4: Demurrage and Despatch
The notice of readiness (NOR) can be tendered by email and shall be considered valid upon receipt, irrespective of whether the vessel is in port or not (WIPON).`,
};


export function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fixtureRecap"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">1. Fixture Recap</FormLabel>
              <FormDescription>
                Enter the key commercial terms as text or upload a file.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Paste fixture recap here..."
                  className="min-h-[150px] font-code text-xs"
                  {...field}
                />
              </FormControl>
              <FileUploader onFileRead={(content) => form.setValue("fixtureRecap", content)} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="baseContract"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">2. Base Contract Template</FormLabel>
              <FormDescription>
                Provide the base contract as structured text (HTML) or upload a file.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Paste base contract (HTML is best) here..."
                  className="min-h-[250px] font-code text-xs"
                  {...field}
                />
              </FormControl>
              <FileUploader onFileRead={(content) => form.setValue("baseContract", content)} convertToHtml={true} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="negotiatedClauses"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">3. Negotiated Clauses</FormLabel>
              <FormDescription>
                Provide any additional or overriding clauses.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Paste negotiated clauses here..."
                  className="min-h-[150px] font-code text-xs"
                  {...field}
                />
              </FormControl>
              <FileUploader onFileRead={(content) => form.setValue("negotiatedClauses", content)} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-12 text-lg" disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          Generate Contract
        </Button>
      </form>
    </Form>
  );
}

function FileUploader({ onFileRead, convertToHtml = false }: { onFileRead: (content: string) => void, convertToHtml?: boolean }) {
  const { toast } = useToast();
  const id = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  // Dynamically load PDF.js only on client side
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setPdfjsLib(pdfjs);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
      }
    };

    loadPdfJs();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;
        try {
          if (convertToHtml) {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            onFileRead(result.value);
          } else {
            const result = await mammoth.extractRawText({ arrayBuffer });
            onFileRead(result.value);
          }
          toast({ title: "File Uploaded", description: `${file.name} content has been loaded.` });
        } catch (error) {
          console.error("Error processing DOCX file:", error);
          toast({ variant: "destructive", title: "Upload Failed", description: "Could not process the DOCX file." });
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === "application/pdf") {
      // Handle PDF files
      if (!pdfjsLib) {
        toast({
          variant: "destructive",
          title: "PDF Processing Unavailable",
          description: "PDF processing is still loading. Please try again in a moment."
        });
        return;
      }

      setIsProcessing(true);
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        try {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n\n';
          }

          onFileRead(fullText.trim());
          toast({
            title: "PDF Uploaded",
            description: `${file.name} content has been extracted and loaded.`
          });
        } catch (error) {
          console.error("Error processing PDF file:", error);
          toast({
            variant: "destructive",
            title: "PDF Processing Failed",
            description: "Could not extract text from the PDF file. Please ensure it's a valid PDF."
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === "text/plain" || file.type === "text/html") {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileRead(text);
        toast({ title: "File Uploaded", description: `${file.name} content has been loaded.` });
      };
      reader.readAsText(file);
    } else {
      toast({ variant: "destructive", title: "Unsupported File Type", description: "Please upload a DOCX, PDF, or TXT file." });
    }
  };

  return (
    <div className="mt-2">
      <label htmlFor={id} className={`relative rounded-md font-medium text-accent hover:text-accent/90 ${isProcessing || !pdfjsLib ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <div className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed rounded-md text-muted-foreground hover:border-accent hover:text-accent transition-colors">
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !pdfjsLib ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          <span>
            {isProcessing ? "Processing PDF..." :
              !pdfjsLib ? "Loading PDF support..." : "Upload a file"}
          </span>
          <span className="text-xs">(DOCX, PDF, TXT)</span>
        </div>
        <Input
          id={id}
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".docx,.pdf,.txt,.html"
          disabled={isProcessing || !pdfjsLib}
        />
      </label>
    </div>
  )
}
