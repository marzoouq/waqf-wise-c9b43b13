import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevicePreviewProps {
  children: ReactNode;
}

type Device = "desktop" | "tablet" | "mobile";

export function DevicePreview({ children }: DevicePreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");

  const deviceWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={device === "desktop" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("desktop")}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          سطح المكتب
        </Button>
        <Button
          variant={device === "tablet" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("tablet")}
          className="gap-2"
        >
          <Tablet className="h-4 w-4" />
          تابلت
        </Button>
        <Button
          variant={device === "mobile" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("mobile")}
          className="gap-2"
        >
          <Smartphone className="h-4 w-4" />
          موبايل
        </Button>
      </div>

      <div className="flex justify-center bg-muted/30 p-8 rounded-lg overflow-auto">
        <div className={cn(
          "transition-all duration-300 border rounded-lg bg-background shadow-lg",
          deviceWidths[device]
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}
