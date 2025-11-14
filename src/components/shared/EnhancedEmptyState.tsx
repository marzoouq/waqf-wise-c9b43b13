import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

export function EnhancedEmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tips,
}: EnhancedEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

        {action && (
          <div className="flex gap-3">
            <Button onClick={action.onClick} size="lg">
              {action.icon && <action.icon className="h-5 w-5 ml-2" />}
              {action.label}
            </Button>
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                size="lg"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}

        {tips && tips.length > 0 && (
          <div className="mt-8 pt-6 border-t w-full max-w-lg">
            <h4 className="text-sm font-semibold mb-3 text-foreground/80">
              💡 نصائح مفيدة:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground text-right">
              {tips.map((tip) => (
                <li key={`tip-${tip.substring(0, 20)}`} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
