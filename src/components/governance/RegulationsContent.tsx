/**
 * محتوى اللائحة التنفيذية للوقف
 * 17 جزء و 22 فصل
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
import { regulationsParts } from "./regulations-data";

export function RegulationsContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-500" />
            محتوى اللائحة التنفيذية
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            17 جزء • 22 فصل
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {regulationsParts.map((part) => {
            const Icon = part.icon;
            return (
              <AccordionItem 
                key={part.id} 
                value={part.id}
                className={`border rounded-lg px-4 ${part.highlight ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : ''}`}
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${part.highlight ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${part.highlight ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-sm font-semibold text-right">{part.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4 pr-11">
                    {part.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="space-y-3">
                        <h4 className="font-semibold text-sm text-primary border-r-2 border-red-500 pr-3">
                          {chapter.title}
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
                                {section.subtitle}
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
                                    <span className="leading-relaxed">{item}</span>
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
