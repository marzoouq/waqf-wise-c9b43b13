import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, ThumbsUp, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { KBArticle } from '@/types/support';

interface KnowledgeBaseArticleCardProps {
  article: KBArticle;
  onView: (id: string) => void;
}

export function KnowledgeBaseArticleCard({ article, onView }: KnowledgeBaseArticleCardProps) {
  const categoryColors = {
    getting_started: 'bg-info-light text-info',
    features: 'bg-success-light text-success',
    troubleshooting: 'bg-warning-light text-warning',
    account: 'bg-secondary text-secondary-foreground',
    billing: 'bg-destructive-light text-destructive',
    other: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
            {article.is_featured && (
              <Badge variant="secondary" className="mt-2">
                <Star className="h-3 w-3 ms-1 fill-current" />
                مميز
              </Badge>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={categoryColors[article.category as keyof typeof categoryColors]}
          >
            {article.category === 'getting_started' && 'البداية'}
            {article.category === 'features' && 'المميزات'}
            {article.category === 'troubleshooting' && 'حل المشاكل'}
            {article.category === 'account' && 'الحساب'}
            {article.category === 'billing' && 'الفواتير'}
            {article.category === 'other' && 'أخرى'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.views_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {article.helpful_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(article.created_at), 'dd MMM yyyy', { locale: ar })}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onView(article.id)}>
          <BookOpen className="h-4 w-4 ms-2" />
          اقرأ المزيد
        </Button>
      </CardFooter>
    </Card>
  );
}
