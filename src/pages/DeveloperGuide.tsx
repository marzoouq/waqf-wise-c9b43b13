import { useEffect, useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Download, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DeveloperGuide = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/DEVELOPER_MASTER_GUIDE.md")
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading developer guide:", error);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "DEVELOPER_MASTER_GUIDE.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOpenRaw = () => {
    window.open("/DEVELOPER_MASTER_GUIDE.md", "_blank");
  };

  if (loading) {
    return (
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="دليل المطور الشامل"
          description="جاري تحميل الدليل..."
          icon={<BookOpen className="h-8 w-8 text-primary" />}
        />
        <Card className="shadow-soft">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full mt-6" />
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    );
  }

  return (
    <PageErrorBoundary pageName="دليل المطور">
      <MobileOptimizedLayout>
        <div className="flex items-center justify-between mb-6">
          <MobileOptimizedHeader
            title="دليل المطور الشامل"
            description="البنية المعمارية، الميزات، والتوثيق الكامل"
            icon={<BookOpen className="h-8 w-8 text-primary" />}
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open("/COMPREHENSIVE_TEST_REPORT.md", "_blank")}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">تقرير الاختبار</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">تحميل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenRaw}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">عرض خام</span>
            </Button>
          </div>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ children, ...props }) => (
                    <h1 className="text-3xl font-bold mb-4 text-primary border-b pb-2" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props}>
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props}>
                      {children}
                    </h4>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="mb-4 text-muted-foreground leading-relaxed" {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
                      {children}
                    </ol>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-border" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-muted" {...props}>
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="border border-border px-4 py-2 text-right font-semibold" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="border border-border px-4 py-2 text-right" {...props}>
                      {children}
                    </td>
                  ),
                  a: ({ children, ...props }) => (
                    <a
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-8 border-border" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default DeveloperGuide;
