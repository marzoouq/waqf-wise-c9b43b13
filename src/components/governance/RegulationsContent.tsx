/**
 * محتوى اللائحة التنفيذية للوقف
 * 17 جزء و 22 فصل - مع دعم البحث
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { regulationsParts, RegulationPart } from "./regulations-data";

interface RegulationsContentProps {
  filteredParts?: RegulationPart[];
  expandedParts?: string[];
  onExpandedChange?: (parts: string[]) => void;
  searchQuery?: string;
}

export function RegulationsContent({
  filteredParts,
  expandedParts,
  onExpandedChange,
  searchQuery,
}: RegulationsContentProps) {
  const parts = filteredParts || regulationsParts;
  
  // تمييز النص المطابق للبحث
  const highlightText = (text: string): React.ReactNode => {
    if (!searchQuery || searchQuery.length < 2) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-500" />
            محتوى اللائحة التنفيذية
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {parts.length} جزء • 22 فصل
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion 
          type="multiple" 
          className="w-full space-y-2"
          value={expandedParts}
          onValueChange={onExpandedChange}
        >
          {parts.map((part) => {
            const Icon = part.icon;
            return (
              <AccordionItem 
                key={part.id} 
                value={part.id}
                data-part-id={part.id}
                className={`border rounded-lg px-4 ${part.highlight ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${part.highlight ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${part.highlight ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-sm font-semibold text-right">
                      {highlightText(part.title)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4 pr-11">
                    {part.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="space-y-3">
                        <h4 className="font-semibold text-sm text-primary border-r-2 border-red-500 pr-3">
                          {highlightText(chapter.title)}
                        </h4>
                        <div className="space-y-3">
                          {chapter.content.map((section, sectionIndex) => (
                            <div 
                              key={sectionIndex} 
                              className={`space-y-2 p-3 rounded-lg ${
                                section.highlight 
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                                  : 'bg-muted/50'
                              }`}
                            >
                              <h5 className={`text-sm font-medium ${section.highlight ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                                {highlightText(section.subtitle)}
                                {section.highlight && (
                                  <Badge variant="outline" className="mr-2 text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300">
                                    هام
                                  </Badge>
                                )}
                              </h5>
                              <ul className="space-y-1.5">
                                {section.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                    <span className="leading-relaxed">{highlightText(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
