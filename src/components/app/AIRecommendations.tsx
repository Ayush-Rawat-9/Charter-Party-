"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, Info, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard, AnimatedListItem } from "./AnimatedWrapper";
import { ClauseExplanation } from "./ClauseExplanation";
import type { RecommendClausesOutput } from "@/ai/flows/recommend-clauses";

interface AIRecommendationsProps {
  recommendations: RecommendClausesOutput | null;
  contractText?: string;
  onAcceptClause: (clauseId: string, clauseText: string) => void;
  onRejectClause: (clauseId: string) => void;
}

const categoryIcons = {
  commercial: Clock,
  legal: Shield,
  operational: Info,
  insurance: Shield,
  arbitration: AlertTriangle,
  force_majeure: AlertTriangle,
};

const categoryColors = {
  commercial: "bg-blue-100 text-blue-800",
  legal: "bg-purple-100 text-purple-800",
  operational: "bg-green-100 text-green-800",
  insurance: "bg-orange-100 text-orange-800",
  arbitration: "bg-red-100 text-red-800",
  force_majeure: "bg-yellow-100 text-yellow-800",
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function AIRecommendations({ recommendations, contractText, onAcceptClause, onRejectClause }: AIRecommendationsProps) {
  const [acceptedClauses, setAcceptedClauses] = useState<Set<string>>(new Set());
  const [rejectedClauses, setRejectedClauses] = useState<Set<string>>(new Set());

  if (!recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            AI will analyze your contract and suggest additional clauses for comprehensive coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Generate a contract to see AI recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAccept = (clauseId: string, clauseText: string) => {
    setAcceptedClauses(prev => new Set(prev).add(clauseId));
    setRejectedClauses(prev => {
      const newSet = new Set(prev);
      newSet.delete(clauseId);
      return newSet;
    });
    onAcceptClause(clauseId, clauseText);
  };

  const handleReject = (clauseId: string) => {
    setRejectedClauses(prev => new Set(prev).add(clauseId));
    setAcceptedClauses(prev => {
      const newSet = new Set(prev);
      newSet.delete(clauseId);
      return newSet;
    });
    onRejectClause(clauseId);
  };

  const acceptedCount = acceptedClauses.size;
  const rejectedCount = rejectedClauses.size;
  const totalCount = recommendations.recommendedClauses.length;

  return (
    <AnimatedCard>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Suggested clauses based on your fixture recap and contract analysis
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Coverage Score</span>
                <span>{recommendations.coverageScore}%</span>
              </div>
              <Progress value={recommendations.coverageScore} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              {acceptedCount} accepted • {rejectedCount} rejected • {totalCount - acceptedCount - rejectedCount} pending
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            {recommendations.summary}
          </div>
          
          <div className="space-y-4">
            {recommendations.recommendedClauses.map((clause, index) => {
              const IconComponent = categoryIcons[clause.category];
              const isAccepted = acceptedClauses.has(clause.clauseId);
              const isRejected = rejectedClauses.has(clause.clauseId);
              
              if (isRejected) return null;

              return (
                <AnimatedListItem key={clause.clauseId} index={index}>
                  <Card className={`transition-all duration-200 ${
                    isAccepted ? 'border-green-200 bg-green-50' : 'border-border'
                  }`}>
                    <CardContent className="p-4">
                                           <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-2">
                         <IconComponent className="h-4 w-4 text-muted-foreground" />
                         <h4 className="font-medium">{clause.title}</h4>
                         {contractText && (
                           <ClauseExplanation
                             clauseId={clause.clauseId}
                             clauseText={clause.clauseText}
                             clauseCategory={clause.category}
                             contractText={contractText}
                           />
                         )}
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className={categoryColors[clause.category]}>
                           {clause.category.replace('_', ' ')}
                         </Badge>
                         <Badge variant="outline" className={priorityColors[clause.priority]}>
                           {clause.priority}
                         </Badge>
                       </div>
                     </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {clause.description}
                      </p>
                      
                      <div className="bg-muted/50 p-3 rounded-md mb-3">
                        <p className="text-sm font-mono whitespace-pre-wrap">
                          {clause.clauseText}
                        </p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-3">
                        <strong>Reasoning:</strong> {clause.reasoning}
                      </div>
                      
                      {!isAccepted && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(clause.clauseId, clause.clauseText)}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept Clause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(clause.clauseId)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {isAccepted && (
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Clause accepted and added to contract</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedListItem>
              );
            })}
          </div>
          
          {rejectedCount > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                {rejectedCount} clause{rejectedCount !== 1 ? 's' : ''} rejected. 
                You can regenerate recommendations to see them again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
