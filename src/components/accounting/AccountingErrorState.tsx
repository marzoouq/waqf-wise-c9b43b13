import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AccountingErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function AccountingErrorState({ error, onRetry }: AccountingErrorStateProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
          <p className="text-sm text-muted-foreground mb-1 max-w-md">
            {error.message || "تعذر تحميل البيانات المحاسبية. الرجاء المحاولة مرة أخرى."}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
