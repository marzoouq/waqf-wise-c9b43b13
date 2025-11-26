import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tablet, Monitor, Maximize } from "lucide-react";

const DEVICE_PRESETS = [
  { name: "iPhone 12 Pro", width: 390, height: 844, icon: Smartphone },
  { name: "iPhone 12 Pro Max", width: 428, height: 926, icon: Smartphone },
  { name: "Samsung Galaxy S21", width: 360, height: 800, icon: Smartphone },
  { name: "iPad", width: 768, height: 1024, icon: Tablet },
  { name: "iPad Pro", width: 1024, height: 1366, icon: Tablet },
  { name: "Desktop 1080p", width: 1920, height: 1080, icon: Monitor },
  { name: "Desktop 1440p", width: 2560, height: 1440, icon: Monitor },
];

export function ResponsiveTester() {
  const [selectedDevice, setSelectedDevice] = useState<typeof DEVICE_PRESETS[0] | null>(null);
  const [customSize, setCustomSize] = useState({ width: 375, height: 667 });
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const getCurrentSize = () => {
    if (!selectedDevice) return customSize;
    
    if (orientation === "landscape") {
      return { width: selectedDevice.height, height: selectedDevice.width };
    }
    return { width: selectedDevice.width, height: selectedDevice.height };
  };

  const size = getCurrentSize();

  const openInNewWindow = () => {
    const url = window.location.href;
    window.open(
      url,
      'responsive-test',
      `width=${size.width},height=${size.height},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اختبار الاستجابة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Presets */}
          <div>
            <h3 className="font-semibold mb-3">أجهزة محددة مسبقاً</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DEVICE_PRESETS.map((device) => {
                const Icon = device.icon;
                return (
                  <Button
                    key={device.name}
                    variant={selectedDevice?.name === device.name ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <Icon className="w-4 h-4 ml-2" />
                    {device.name}
                    <span className="mr-auto text-xs text-muted-foreground">
                      {device.width}×{device.height}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Orientation Toggle */}
          {selectedDevice && (
            <div>
              <h3 className="font-semibold mb-3">الاتجاه</h3>
              <div className="flex gap-2">
                <Button
                  variant={orientation === "portrait" ? "default" : "outline"}
                  onClick={() => setOrientation("portrait")}
                >
                  عمودي (Portrait)
                </Button>
                <Button
                  variant={orientation === "landscape" ? "default" : "outline"}
                  onClick={() => setOrientation("landscape")}
                >
                  أفقي (Landscape)
                </Button>
              </div>
            </div>
          )}

          {/* Custom Size */}
          <div>
            <h3 className="font-semibold mb-3">حجم مخصص</h3>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">العرض</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={customSize.width}
                  onChange={(e) => {
                    setCustomSize({ ...customSize, width: parseInt(e.target.value) || 0 });
                    setSelectedDevice(null);
                  }}
                />
              </div>
              <span className="text-2xl pb-2">×</span>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">الارتفاع</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={customSize.height}
                  onChange={(e) => {
                    setCustomSize({ ...customSize, height: parseInt(e.target.value) || 0 });
                    setSelectedDevice(null);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Current Size Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الحجم الحالي</p>
                <p className="text-xl font-bold">
                  {size.width} × {size.height}
                  <span className="text-sm font-normal text-muted-foreground mr-2">
                    ({(size.width * size.height / 1000000).toFixed(2)} megapixels)
                  </span>
                </p>
              </div>
              <Badge variant="outline">
                {size.width > 1024 ? "Desktop" : size.width > 768 ? "Tablet" : "Mobile"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={openInNewWindow}>
              <Maximize className="w-4 h-4 ml-2" />
              فتح في نافذة جديدة
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>💡 <strong>نصيحة:</strong> استخدم أدوات المطور في المتصفح (F12) للحصول على أدوات اختبار أكثر تقدماً</p>
            <p>🔍 في Chrome: اضغط Ctrl+Shift+M (أو Cmd+Shift+M في Mac) لفتح وضع الجهاز</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
