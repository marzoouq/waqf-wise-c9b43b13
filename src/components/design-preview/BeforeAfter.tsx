import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  label?: string;
}

export function BeforeAfter({ before, after, label = "مقارنة" }: BeforeAfterProps) {
  const [showNew, setShowNew] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNew(!showNew)}
          className="gap-2"
        >
          {showNew ? (
            <>
              <Eye className="h-4 w-4" />
              عرض القديم
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              عرض الجديد
            </>
          )}
        </Button>
      </div>

      <div className="relative rounded-lg border-2 border-dashed p-4">
        <div className="absolute top-2 right-2 z-10">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            showNew 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {showNew ? '✨ تصميم جديد' : '📦 تصميم قديم'}
          </span>
        </div>
        <div className="mt-8">
          {showNew ? after : before}
        </div>
      </div>
    </div>
  );
}
