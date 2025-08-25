"use client";

import { AlertTriangle, CheckCircle, Info, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalyzeClauseRiskOutput } from "@/ai/flows/clause-risk-analyzer";
import type { CheckComplianceOutput } from "@/ai/flows/compliance-checker";

interface RiskAnalysisProps {
  risks: AnalyzeClauseRiskOutput["risks"];
  findings: AnalyzeClauseRiskOutput["findings"];
  compliance?: CheckComplianceOutput | null;
}

const severityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const complianceStatusColors = {
  present: "bg-green-100 text-green-800",
  missing: "bg-red-100 text-red-800",
  incomplete: "bg-yellow-100 text-yellow-800",
  conflicting: "bg-orange-100 text-orange-800",
};

const impactColors = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RiskAnalysis({ risks, findings, compliance }: RiskAnalysisProps) {
  const riskSeverityData = risks.reduce((acc, risk) => {
    acc[risk.severity] = (acc[risk.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskChartData = Object.entries(riskSeverityData).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981',
  }));

  const complianceChartData = compliance ? [
    { name: 'Commercial', value: compliance.scores.commercial, color: '#3b82f6' },
    { name: 'Legal', value: compliance.scores.legal, color: '#8b5cf6' },
    { name: 'Operational', value: compliance.scores.operational, color: '#10b981' },
  ] : [];

  const complianceStatusData = compliance ? compliance.complianceItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const statusChartData = Object.entries(complianceStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'present' ? '#10b981' : status === 'missing' ? '#ef4444' : status === 'incomplete' ? '#f59e0b' : '#f97316',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risk & Compliance Analysis
        </CardTitle>
        <CardDescription>
          AI-powered risk assessment and compliance verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="risks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risks" className="mt-4 space-y-4">
            {risks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-green-700 font-medium">No risks identified</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your contract appears to be well-structured and consistent
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.map((risk) => (
                  <Card key={risk.sectionId} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{risk.sectionId}</h4>
                        <Badge variant="outline" className={severityColors[risk.severity]}>
                          {risk.severity} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{risk.note}</p>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">Suggestion:</p>
                        <p className="text-sm">{risk.suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {findings.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Additional Findings
                </h4>
                <div className="space-y-2">
                  {findings.map((finding, index) => (
                    <div key={index} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                      {finding}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="mt-4 space-y-4">
            {!compliance ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a contract to see compliance analysis</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{compliance.scores.overall}%</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{compliance.scores.commercial}%</div>
                    <div className="text-sm text-muted-foreground">Commercial</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{compliance.scores.legal}%</div>
                    <div className="text-sm text-muted-foreground">Legal</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {compliance.complianceItems.map((item) => (
                    <Card key={item.itemId} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{item.requirement}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={complianceStatusColors[item.status]}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className={impactColors[item.impact]}>
                              {item.impact} impact
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium mb-1">Suggestion:</p>
                          <p className="text-sm">{item.suggestion}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {compliance.criticalIssues.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Critical Issues</h4>
                    <ul className="space-y-1">
                      {compliance.criticalIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-700">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={riskChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {riskChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {compliance && complianceChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={complianceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {compliance && statusChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
