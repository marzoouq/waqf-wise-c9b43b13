import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Eye } from 'lucide-react';
import type { KBFAQ } from '@/types/support';

interface FAQAccordionProps {
  faqs: KBFAQ[];
  onRate?: (id: string) => void;
}

export function FAQAccordion({ faqs, onRate }: FAQAccordionProps) {
  const categoryColors = {
    general: 'bg-info-light text-info',
    account: 'bg-secondary text-secondary-foreground',
    billing: 'bg-destructive-light text-destructive',
    technical: 'bg-warning-light text-warning',
    features: 'bg-success-light text-success',
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: 'عام',
      account: 'الحساب',
      billing: 'الفواتير',
      technical: 'تقني',
      features: 'المميزات',
    };
    return labels[category] || category;
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {faqs.map((faq) => (
        <AccordionItem 
          key={faq.id} 
          value={faq.id}
          className="border rounded-lg px-4 hover:shadow-md transition-shadow"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-start justify-between w-full gap-4">
              <span className="text-right font-medium">{faq.question}</span>
              <Badge 
                variant="outline" 
                className={categoryColors[faq.category as keyof typeof categoryColors]}
              >
                {getCategoryLabel(faq.category)}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-right space-y-4">
            <div className="text-muted-foreground whitespace-pre-line">
              {faq.answer}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {faq.views_count || 0} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {faq.helpful_count || 0} مفيدة
                </span>
              </div>
              
              {onRate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRate(faq.id)}
                >
                  <ThumbsUp className="h-4 w-4 ml-2" />
                  مفيدة
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
