/**
 * Knowledge FAQs Tab Component
 * تبويب الأسئلة الشائعة في قاعدة المعرفة
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KnowledgeFAQ } from "@/hooks/useKnowledgeArticles";

interface KnowledgeFAQsTabProps {
  faqs: KnowledgeFAQ[];
}

export function KnowledgeFAQsTab({ faqs }: KnowledgeFAQsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الأسئلة الأكثر شيوعاً</CardTitle>
        <CardDescription>
          إجابات سريعة على الأسئلة الأكثر تكراراً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-right">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
