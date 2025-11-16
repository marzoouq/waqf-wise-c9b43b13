import { useState } from 'react';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Eye, ThumbsUp, Star } from 'lucide-react';

export function KnowledgeBaseView() {
  const { articles, featuredArticles, articlesLoading } = useKnowledgeBase();
  const [search, setSearch] = useState('');

  const filteredArticles = articles?.filter(
    (article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.summary?.toLowerCase().includes(search.toLowerCase())
  );

  if (articlesLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في قاعدة المعرفة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Featured Articles */}
      {featuredArticles && featuredArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            المقالات المميزة
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {article.summary}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {article.helpful_count}
                    </div>
                  </div>
                  <Button variant="link" className="mt-3 p-0">
                    قراءة المقال ←
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Articles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          جميع المقالات
        </h2>

        {filteredArticles && filteredArticles.length > 0 ? (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{article.category}</Badge>
                      {article.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-semibold text-lg">{article.title}</h3>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views_count} مشاهدة
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful_count} مفيد
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    قراءة
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-4xl">📚</div>
              <h3 className="text-xl font-semibold">لا توجد مقالات</h3>
              <p className="text-muted-foreground">
                {search ? 'لم يتم العثور على نتائج للبحث' : 'لم يتم إضافة مقالات بعد'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
