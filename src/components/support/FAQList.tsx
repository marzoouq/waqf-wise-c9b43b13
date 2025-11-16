import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

export function FAQList() {
  const { faqs, faqsLoading } = useKnowledgeBase();

  if (faqsLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  if (!faqs || faqs.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="text-4xl">❓</div>
          <h3 className="text-xl font-semibold">لا توجد أسئلة شائعة</h3>
          <p className="text-muted-foreground">
            لم يتم إضافة أسئلة شائعة بعد
          </p>
        </div>
      </Card>
    );
  }

  // Group FAQs by category
  const faqsByCategory = faqs.reduce((acc: any, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(faqsByCategory).map(([category, categoryFaqs]: [string, any]) => (
        <Card key={category} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{category}</h2>
            <Badge variant="secondary">{categoryFaqs.length}</Badge>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {categoryFaqs.map((faq: any) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-right">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      ))}
    </div>
  );
}
