import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

interface MobilePropertyCardProps {
  property: {
    id: string;
    name: string;
    type?: string;
    location: string;
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold leading-tight">{property.name}</p>
              {property.type && getPropertyTypeBadge(property.type)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">{property.location}</p>
          </div>

          {property.status && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">الحالة:</span>
              <Badge variant="outline">{property.status}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
