"use client";

import { useState, useEffect } from "react";
import { ChevronRight, FileText, DollarSign, Shield, Clock, Anchor, AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ContractSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'commercial' | 'legal' | 'operational';
  hasIssues?: boolean;
  issueCount?: number;
}

interface SidebarNavigatorProps {
  contractHtml: string;
  onSectionClick: (sectionId: string) => void;
  activeSection?: string;
}

const sectionIcons = {
  vessel: Anchor,
  cargo: FileText,
  payment: DollarSign,
  demurrage: Clock,
  laytime: Clock,
  insurance: Shield,
  arbitration: AlertTriangle,
  force_majeure: AlertTriangle,
  delivery: Anchor,
  bunkering: Settings,
  deviation: Settings,
  agency: Settings,
  general: FileText,
};

const categoryColors = {
  commercial: "bg-blue-100 text-blue-800",
  legal: "bg-purple-100 text-purple-800",
  operational: "bg-green-100 text-green-800",
};

export function SidebarNavigator({ contractHtml, onSectionClick, activeSection }: SidebarNavigatorProps) {
  const [sections, setSections] = useState<ContractSection[]>([]);

  useEffect(() => {
    if (contractHtml) {
      const extractedSections = extractSectionsFromHtml(contractHtml);
      setSections(extractedSections);
    }
  }, [contractHtml]);

  const extractSectionsFromHtml = (html: string): ContractSection[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const sections: ContractSection[] = [];
    
    headings.forEach((heading, index) => {
      const text = heading.textContent?.trim();
      if (!text) return;
      
      // Generate a unique ID for the section
      const id = `section-${index}`;
      
      // Determine category and icon based on heading text
      const { category, icon } = categorizeSection(text);
      
      sections.push({
        id,
        title: text,
        icon,
        category,
      });
    });
    
    return sections;
  };

  const categorizeSection = (title: string): { category: ContractSection['category']; icon: React.ComponentType<{ className?: string }> } => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('vessel') || lowerTitle.includes('ship')) {
      return { category: 'commercial', icon: sectionIcons.vessel };
    }
    if (lowerTitle.includes('cargo') || lowerTitle.includes('freight')) {
      return { category: 'commercial', icon: sectionIcons.cargo };
    }
    if (lowerTitle.includes('payment') || lowerTitle.includes('freight rate')) {
      return { category: 'commercial', icon: sectionIcons.payment };
    }
    if (lowerTitle.includes('demurrage') || lowerTitle.includes('despatch')) {
      return { category: 'commercial', icon: sectionIcons.demurrage };
    }
    if (lowerTitle.includes('laytime') || lowerTitle.includes('lay days')) {
      return { category: 'operational', icon: sectionIcons.laytime };
    }
    if (lowerTitle.includes('insurance') || lowerTitle.includes('p&i')) {
      return { category: 'legal', icon: sectionIcons.insurance };
    }
    if (lowerTitle.includes('arbitration') || lowerTitle.includes('dispute')) {
      return { category: 'legal', icon: sectionIcons.arbitration };
    }
    if (lowerTitle.includes('force majeure') || lowerTitle.includes('act of god')) {
      return { category: 'legal', icon: sectionIcons.force_majeure };
    }
    if (lowerTitle.includes('delivery') || lowerTitle.includes('redelivery')) {
      return { category: 'operational', icon: sectionIcons.delivery };
    }
    if (lowerTitle.includes('bunkering') || lowerTitle.includes('fuel')) {
      return { category: 'operational', icon: sectionIcons.bunkering };
    }
    if (lowerTitle.includes('deviation') || lowerTitle.includes('route')) {
      return { category: 'operational', icon: sectionIcons.deviation };
    }
    if (lowerTitle.includes('agency') || lowerTitle.includes('port agent')) {
      return { category: 'operational', icon: sectionIcons.agency };
    }
    
    return { category: 'commercial', icon: sectionIcons.general };
  };

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, ContractSection[]>);

  const categoryLabels = {
    commercial: 'Commercial Terms',
    legal: 'Legal & Compliance',
    operational: 'Operational',
  };

  if (sections.length === 0) {
    return (
      <div className="w-64 border-r bg-muted/20 p-4">
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No sections found</p>
          <p className="text-xs">Generate a contract to see navigation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Contract Sections</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {sections.length} sections found
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {Object.entries(groupedSections).map(([category, categorySections]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2 px-2">
                <Badge variant="outline" className={`text-xs ${categoryColors[category as keyof typeof categoryColors]}`}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categorySections.length}
                </span>
              </div>
              
              <div className="space-y-1">
                {categorySections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <Button
                      key={section.id}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start h-auto py-2 px-2 text-left"
                      onClick={() => onSectionClick(section.id)}
                    >
                      <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {section.title}
                        </div>
                        {section.hasIssues && section.issueCount && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">
                              {section.issueCount} issue{section.issueCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1">
            <span>Total Sections:</span>
            <span className="font-medium">{sections.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active:</span>
            <span className="font-medium">{activeSection ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

