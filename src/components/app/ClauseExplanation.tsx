"use client";

import { useState } from "react";
import { Info, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { explainClauseRisk } from "@/ai/flows/explain-risks";
import type { ExplainClauseRiskOutput } from "@/ai/flows/explain-risks";

interface ClauseExplanationProps {
  clauseId: string;
  clauseText: string;
  clauseCategory: string;
  contractText: string;
  className?: string;
}

const riskLevelColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const riskLevelIcons = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertTriangle,
};

export function ClauseExplanation({ 
  clauseId, 
  clauseText, 
  clauseCategory, 
  contractText, 
  className = "" 
}: ClauseExplanationProps) {
  const [explanation, setExplanation] = useState<ExplainClauseRiskOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExplain = async () => {
    if (explanation) return; // Already loaded
    
    setIsLoading(true);
    try {
      const result = await explainClauseRisk({
        contractText,
        clauseText,
        clauseId,
        clauseCategory: clauseCategory as any,
      });
      setExplanation(result);
    } catch (error) {
      console.error("Failed to get explanation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const RiskLevelIcon = explanation ? riskLevelIcons[explanation.riskLevel] : Info;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${className}`}
            onClick={handleExplain}
            disabled={isLoading}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                {isLoading ? (
                  <Skeleton className="h-4 w-4 rounded" />
                ) : (
                  <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Click to see detailed explanation</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RiskLevelIcon className="h-5 w-5" />
              Clause Explanation
            </DialogTitle>
            <DialogDescription>
              AI-generated analysis of risks and benefits
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* Risk Level */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={riskLevelColors[explanation.riskLevel]}>
                  {explanation.riskLevel.toUpperCase()} RISK
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Risk assessment
                </span>
              </div>

              {/* Main Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {explanation.explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Benefits */}
              {explanation.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {explanation.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {explanation.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Potential Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {explanation.risks.map((risk, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Legal Implications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal Implications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {explanation.legalImplications}
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {explanation.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {explanation.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click the info icon to get an explanation</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

