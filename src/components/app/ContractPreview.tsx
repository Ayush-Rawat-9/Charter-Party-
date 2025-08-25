"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";
import { downloadPdf } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ContractPreviewProps {
  htmlContent: string;
  warnings: string[];
  onContentChange?: (editedContent: string) => void;
}

export function ContractPreview({ htmlContent, warnings, onContentChange }: ContractPreviewProps) {
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [editedContent, setEditedContent] = useState(htmlContent);
  const { toast } = useToast();

  // Calculate total pages based on content height
  useEffect(() => {
    const contentHeight = 1123; // A4 height in pixels at 96 DPI
    const contentElement = document.querySelector('.contract-content');
    if (contentElement) {
      const scrollHeight = contentElement.scrollHeight;
      const calculatedPages = Math.ceil(scrollHeight / contentHeight);
      setTotalPages(Math.max(1, calculatedPages));
    }
  }, [htmlContent]);

  // Trigger animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Update edited content when htmlContent changes
  useEffect(() => {
    setEditedContent(htmlContent);
  }, [htmlContent]);

  const handlePdfDownload = async () => {
    setIsPdfDownloading(true);
    try {
      const result = await downloadPdf(editedContent);
      if (result.pdfBase64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = "charter-party-contract.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Download Started",
          description: "Your PDF file is downloading.",
        });
      } else {
        throw new Error("Failed to get PDF data from the server.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "PDF Download Failed",
        description: errorMessage,
      });
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleContentEdit = (event: React.FormEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const newContent = target.innerHTML;
    setEditedContent(newContent);
    onContentChange?.(newContent);
  };



  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
          }}
          className="w-full"
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-slate-800">Contract Preview</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 50}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-slate-600 min-w-[3rem] text-center">
                      {zoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 200}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Page Navigation */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage >= totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Export Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePdfDownload}
                    disabled={isPdfDownloading}
                    className="h-8"
                  >
                    {isPdfDownloading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Warnings */}
              {warnings && warnings.length > 0 && (
                <Alert variant="default" className="m-6 bg-amber-50 border-amber-200">
                  <FileWarning className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Merge Warnings</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* A4 Paper Container */}
              <div className="flex justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[800px]">
                <motion.div
                  className="contract-paper"
                  style={{
                    width: `${(210 * zoom) / 100}mm`,
                    minHeight: `${(297 * zoom) / 100}mm`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* A4 Paper */}
                  <div className="bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden">
                    {/* Paper margins and content */}
                    <div
                      className="contract-content prose prose-lg max-w-none"
                      style={{
                        padding: `${(20 * zoom) / 100}mm`,
                        fontFamily: '"Times New Roman", Georgia, serif',
                        fontSize: `${(12 * zoom) / 100}px`,
                        lineHeight: 1.6,
                        color: '#1f2937',
                      }}
                    >
                      {/* Contract Header */}
                      <div className="text-center mb-8 pb-6 border-b-2 border-slate-300">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                          CHARTER PARTY CONTRACT
                        </h1>
                        <ClientDate />
                        <p className="text-sm text-slate-500 mt-2 italic">
                          Click anywhere in the contract to edit
                        </p>

                      </div>

                      {/* Contract Content */}
                      <div
                        className="contract-body"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={handleContentEdit}
                        dangerouslySetInnerHTML={{ __html: editedContent }}
                        style={{
                          fontFamily: '"Times New Roman", Georgia, serif',
                          outline: 'none',
                          minHeight: '100px',
                          textAlign: 'justify',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ClientDate() {
  const [dateText, setDateText] = useState<string | null>(null);
  useEffect(() => {
    setDateText(new Date().toLocaleDateString());
  }, []);
  return (
    <p className="text-slate-600 font-medium" suppressHydrationWarning>
      Generated on {dateText ?? ''}
    </p>
  );
}
