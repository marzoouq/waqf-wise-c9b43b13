import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

interface MobilePropertyCardProps {
  property: {
    id: string;
    name: string;
    type?: string;
    location?: string;
    status?: string;
  };
}

export function MobilePropertyCard({ property }: MobilePropertyCardProps) {
  const getPropertyTypeBadge = (type: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" }> = {
      "سكني": { variant: "default" },
      "تجاري": { variant: "secondary" },
      "زراعي": { variant: "outline" },
    };

    return <Badge variant={config[type]?.variant || "secondary"}>{type}</Badge>;
  };

  return (
    <Card className="hover-scale">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-semibold text-sm truncate">{property.name}</h3>
          </div>
          {property.type && getPropertyTypeBadge(property.type)}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{property.location || "—"}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <span className="text-muted-foreground">الحالة:</span>
          <Badge variant="outline">{property.status || "نشط"}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
