/**
 * Knowledge Articles Tab Component
 * تبويب المقالات في قاعدة المعرفة
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { KnowledgeArticle } from "@/hooks/ui/useKnowledgeArticles";

interface KnowledgeArticlesTabProps {
  articles: KnowledgeArticle[];
}

export function KnowledgeArticlesTab({ articles }: KnowledgeArticlesTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {articles.map((article) => (
        <Card key={article.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {article.category}
              </span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{article.title}</CardTitle>
            <CardDescription>{article.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.content}
            </p>
            <Button variant="link" className="mt-2 p-0">
              اقرأ المزيد ←
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
