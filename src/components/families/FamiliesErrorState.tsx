import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FamiliesErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function FamiliesErrorState({ error, onRetry }: FamiliesErrorStateProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-destructive">حدث خطأ في تحميل البيانات</h3>
        <p className="text-muted-foreground mb-2 max-w-md">
          {error.message || 'فشل تحميل بيانات العائلات. يرجى المحاولة مرة أخرى.'}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.
        </p>

        <Button onClick={onRetry} size="lg">
          إعادة المحاولة
        </Button>
      </CardContent>
    </Card>
  );
}
