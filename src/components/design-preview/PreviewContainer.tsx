import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PreviewContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PreviewContainer({ title, description, children }: PreviewContainerProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
