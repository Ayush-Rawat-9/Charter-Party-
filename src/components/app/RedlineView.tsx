"use client";

import { useState } from "react";
import { Eye, EyeOff, FileText, GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GenerateRedlineOutput } from "@/ai/flows/redline-generator";

interface RedlineViewProps {
  redlineData: GenerateRedlineOutput | null;
  cleanContract: string;
}

const changeTypeIcons = {
  added: TrendingUp,
  removed: TrendingDown,
  modified: Minus,
};

const changeTypeColors = {
  added: "bg-green-100 text-green-800",
  removed: "bg-red-100 text-red-800",
  modified: "bg-yellow-100 text-yellow-800",
};

const impactColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function RedlineView({ redlineData, cleanContract }: RedlineViewProps) {
  const [activeTab, setActiveTab] = useState<"clean" | "redlined" | "changes">("clean");

  if (!redlineData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Contract View
          </CardTitle>
          <CardDescription>
            Toggle between clean and redlined versions of your contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Generate a contract to see redline options</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { redlinedContract, changes, changeStats, summary } = redlineData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-primary" />
          Contract View
        </CardTitle>
        <CardDescription>
          Compare clean and redlined versions of your contract
        </CardDescription>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              +{changeStats.added} added
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              -{changeStats.removed} removed
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              ~{changeStats.modified} modified
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {changeStats.total} total changes
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clean" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Clean Contract
            </TabsTrigger>
            <TabsTrigger value="redlined" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Redlined Contract
            </TabsTrigger>
            <TabsTrigger value="changes" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Change Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clean" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: cleanContract }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="redlined" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <div className="mb-4 p-3 bg-muted/50 rounded-md">
                <h4 className="font-medium mb-2">Redline Legend</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 bg-green-200 rounded"></span>
                    Green = Added
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 bg-red-200 rounded"></span>
                    Red = Removed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 bg-yellow-200 rounded"></span>
                    Yellow = Modified
                  </span>
                </div>
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: redlinedContract }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="changes" className="mt-4">
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
              
              <div className="space-y-3">
                {changes.map((change) => {
                  const IconComponent = changeTypeIcons[change.type];
                  
                  return (
                    <Card key={change.changeId} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{change.section}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={changeTypeColors[change.type]}>
                              {change.type}
                            </Badge>
                            <Badge variant="outline" className={impactColors[change.impact]}>
                              {change.impact} impact
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {change.description}
                        </p>
                        
                        {change.originalText && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Original:</p>
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <span className="line-through text-red-700">{change.originalText}</span>
                            </div>
                          </div>
                        )}
                        
                        {change.newText && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">New:</p>
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                              <span className="text-green-700">{change.newText}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

