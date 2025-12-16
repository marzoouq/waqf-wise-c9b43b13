/**
 * Knowledge Base Page - Refactored
 * صفحة قاعدة المعرفة - مُعاد هيكلتها
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, FileText, HelpCircle, Video, Download } from "lucide-react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/shared/LoadingState";
import { useKnowledgeArticles, useKnowledgeFAQs } from "@/hooks/ui/useKnowledgeArticles";
import {
  KnowledgeArticlesTab,
  KnowledgeFAQsTab,
  KnowledgeVideosTab,
  KnowledgeDownloadsTab,
} from "@/components/knowledge";

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: articles = [], isLoading: articlesLoading } = useKnowledgeArticles();
  const { data: faqs = [], isLoading: faqsLoading } = useKnowledgeFAQs();

  const filteredArticles = useMemo(() => 
    articles.filter(article =>
      article.title.includes(searchQuery) || 
      article.description?.includes(searchQuery) ||
      article.category.includes(searchQuery)
    ), [articles, searchQuery]);

  const filteredFAQs = useMemo(() => 
    faqs.filter(faq =>
      faq.question.includes(searchQuery) || 
      faq.answer.includes(searchQuery)
    ), [faqs, searchQuery]);

  if (articlesLoading || faqsLoading) {
    return <LoadingState message="جاري تحميل قاعدة المعرفة..." />;
  }

  return (
    <PageErrorBoundary pageName="قاعدة المعرفة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="قاعدة المعرفة"
          description="دليل شامل ومقالات مساعدة لاستخدام النظام"
          icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث في قاعدة المعرفة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="ابحث عن مقالات، أسئلة شائعة، أو إرشادات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="articles" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full min-w-max h-auto p-1">
              <TabsTrigger value="articles" className="text-xs sm:text-sm min-h-[44px]">
                <FileText className="h-4 w-4 ms-1" />
                <span className="hidden sm:inline">المقالات</span> ({filteredArticles.length})
              </TabsTrigger>
              <TabsTrigger value="faqs" className="text-xs sm:text-sm min-h-[44px]">
                <HelpCircle className="h-4 w-4 ms-1" />
                <span className="hidden sm:inline">الأسئلة الشائعة</span> ({filteredFAQs.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-xs sm:text-sm min-h-[44px]">
                <Video className="h-4 w-4 ms-1" />
                <span className="hidden sm:inline">شروحات فيديو</span>
              </TabsTrigger>
              <TabsTrigger value="downloads" className="text-xs sm:text-sm min-h-[44px]">
                <Download className="h-4 w-4 ms-1" />
                <span className="hidden sm:inline">التنزيلات</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="articles" className="space-y-4">
            <KnowledgeArticlesTab articles={filteredArticles} />
          </TabsContent>

          <TabsContent value="faqs">
            <KnowledgeFAQsTab faqs={filteredFAQs} />
          </TabsContent>

          <TabsContent value="videos">
            <KnowledgeVideosTab />
          </TabsContent>

          <TabsContent value="downloads">
            <KnowledgeDownloadsTab />
          </TabsContent>
        </Tabs>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default KnowledgeBase;
