import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, Eye, Calendar, Share2, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useArticle } from '@/hooks/useKnowledgeBase';
import { LoadingState } from '@/components/shared/LoadingState';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

interface ArticleViewDialogProps {
  articleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRate: (id: string, helpful: boolean) => void;
}

export function ArticleViewDialog({ articleId, open, onOpenChange, onRate }: ArticleViewDialogProps) {
  const { article, isLoading } = useArticle(articleId || '');

  const handleShare = () => {
    if (article) {
      navigator.clipboard.writeText(`${window.location.origin}/support/article/${article.id}`);
      toast.success('تم نسخ الرابط');
    }
  };

  if (!articleId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">مقالة من قاعدة المعرفة</DialogTitle>
          <DialogDescription className="text-right">
            تفاصيل المقالة والمحتوى الكامل
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="جاري تحميل المقالة..." />
        ) : article ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <Badge variant={article.is_featured ? "default" : "outline"}>
                  {article.is_featured ? 'مميز' : article.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views_count || 0} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: ar })}
                </span>
                {article.updated_at && (
                  <span className="text-xs">
                    آخر تحديث: {format(new Date(article.updated_at), 'dd/MM/yyyy', { locale: ar })}
                  </span>
                )}
              </div>

              {article.summary && (
                <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  {article.summary}
                </p>
              )}
            </div>

            <Separator />

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">هل كانت هذه المقالة مفيدة؟</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRate(article.id, true);
                    toast.success('شكراً لتقييمك الإيجابي!');
                  }}
                >
                  <ThumbsUp className="h-4 w-4 ms-2" />
                  مفيدة ({article.helpful_count || 0})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRate(article.id, false);
                    toast.info('شكراً لملاحظاتك، سنعمل على تحسين المحتوى');
                  }}
                >
                  <ThumbsDown className="h-4 w-4 ms-2" />
                  غير مفيدة ({article.not_helpful_count || 0})
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 ms-2" />
                  مشاركة
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 ms-2" />
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لم يتم العثور على المقالة
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
