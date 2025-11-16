import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  Plus,
  Clock,
  CheckCircle,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Star
} from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { CreateTicketDialog } from '@/components/support/CreateTicketDialog';
import { TicketDetailsDialog } from '@/components/support/TicketDetailsDialog';
import { TicketRatingDialog } from '@/components/support/TicketRatingDialog';
import { KnowledgeBaseArticleCard } from '@/components/support/KnowledgeBaseArticleCard';
import { ArticleViewDialog } from '@/components/support/ArticleViewDialog';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { KnowledgeBaseSearch } from '@/components/support/KnowledgeBaseSearch';
import { LoadingState } from '@/components/shared/LoadingState';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { SupportFilters } from '@/types/support';
import { Database } from '@/integrations/supabase/types';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];

const statusLabels = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغية',
};

const statusColors = {
  open: 'default',
  in_progress: 'secondary',
  waiting_customer: 'outline',
  resolved: 'default',
  closed: 'secondary',
  cancelled: 'destructive',
} as const;

export default function Support() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ratingTicketId, setRatingTicketId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupportFilters>({});
  const [articleSearch, setArticleSearch] = useState('');
  const [faqSearch, setFaqSearch] = useState('');

  // تنظيف الـ filters من القيم الفارغة لتوحيد query keys
  const cleanFilters: SupportFilters = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
      (cleanFilters as any)[key] = value;
    }
  });

  const { tickets, isLoading: ticketsLoading } = useSupportTickets(Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined);
  const { 
    articles, 
    faqs, 
    articlesLoading, 
    faqsLoading, 
    incrementViews,
    rateArticle 
  } = useKnowledgeBase();

  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
    article.content.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const filteredFaqs = faqs?.filter(faq =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            تذكرة جديدة
          </Button>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">تذاكري</TabsTrigger>
            <TabsTrigger value="knowledge">قاعدة المعرفة</TabsTrigger>
            <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تذاكر الدعم الخاصة بي</CardTitle>
                <CardDescription>
                  متابعة حالة جميع تذاكر الدعم الفني
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="البحث في التذاكر..."
                      value={filters.search || ''}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="flex-1"
                    />
                  </div>

                  {ticketsLoading ? (
                    <LoadingState message="جاري تحميل التذاكر..." />
                  ) : tickets && tickets.length > 0 ? (
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{ticket.subject}</p>
                              <Badge variant="outline" className="text-xs">
                                #{ticket.ticket_number}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(ticket.created_at), 'PP', { locale: ar })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {ticket.response_count} رد
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={statusColors[ticket.status as keyof typeof statusColors]}>
                              {statusLabels[ticket.status as keyof typeof statusLabels]}
                            </Badge>
                            {ticket.status === 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRatingTicketId(ticket.id);
                                }}
                              >
                                <Star className="h-3 w-3 ml-1" />
                                تقييم
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لا توجد تذاكر</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إنشاء تذكرة جديدة
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  قاعدة المعرفة
                </CardTitle>
                <CardDescription>
                  مقالات ومواضيع مفيدة لحل المشاكل الشائعة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <KnowledgeBaseSearch
                    value={articleSearch}
                    onChange={setArticleSearch}
                    placeholder="ابحث في المقالات..."
                  />

                  {articlesLoading ? (
                    <LoadingState message="جاري تحميل المقالات..." />
                  ) : filteredArticles && filteredArticles.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredArticles.map((article) => (
                        <KnowledgeBaseArticleCard
                          key={article.id}
                          article={article}
                          onView={(id) => setSelectedArticleId(id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {articleSearch ? 'لم يتم العثور على مقالات' : 'لا توجد مقالات متاحة'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  الأسئلة الشائعة
                </CardTitle>
                <CardDescription>
                  إجابات سريعة للأسئلة الأكثر شيوعاً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <KnowledgeBaseSearch
                    value={faqSearch}
                    onChange={setFaqSearch}
                    placeholder="ابحث في الأسئلة الشائعة..."
                  />

                  {faqsLoading ? (
                    <LoadingState message="جاري تحميل الأسئلة..." />
                  ) : filteredFaqs && filteredFaqs.length > 0 ? (
                    <FAQAccordion 
                      faqs={filteredFaqs} 
                      onRate={(id) => {
                        incrementViews.mutate({ id, type: 'faq' });
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {faqSearch ? 'لم يتم العثور على أسئلة' : 'لا توجد أسئلة شائعة'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateTicketDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />

        <TicketRatingDialog
          ticketId={ratingTicketId}
          open={!!ratingTicketId}
          onOpenChange={(open) => !open && setRatingTicketId(null)}
        />

        <ArticleViewDialog
          articleId={selectedArticleId}
          open={!!selectedArticleId}
          onOpenChange={(open) => !open && setSelectedArticleId(null)}
          onRate={(id, helpful) => rateArticle.mutate({ id, helpful })}
        />
      </div>
    </MainLayout>
  );
}
