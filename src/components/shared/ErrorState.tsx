import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "حدث خطأ",
  message = "عذراً، حدث خطأ أثناء تحميل البيانات",
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>{message}</CardDescription>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        {content}
      </div>
    );
  }

  return <div className="p-6 flex items-center justify-center">{content}</div>;
}
