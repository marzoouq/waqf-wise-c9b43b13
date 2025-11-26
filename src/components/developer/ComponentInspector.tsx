import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crosshair, X } from "lucide-react";
import { toast } from "sonner";

export function ComponentInspector() {
  const [inspecting, setInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementInfo, setElementInfo] = useState<any>(null);

  useEffect(() => {
    if (!inspecting) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.developer-tools')) return; // تجاهل لوحة المطور نفسها
      
      target.style.outline = '2px solid #3b82f6';
      target.style.outlineOffset = '2px';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.style.outline = '';
      target.style.outlineOffset = '';
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target.closest('.developer-tools')) return;

      setSelectedElement(target);
      
      // جمع معلومات العنصر
      const rect = target.getBoundingClientRect();
      const styles = window.getComputedStyle(target);
      
      setElementInfo({
        tagName: target.tagName.toLowerCase(),
        className: typeof target.className === 'string' 
          ? target.className 
          : (target.className as any)?.baseVal || '',
        id: target.id,
        textContent: target.textContent?.substring(0, 100),
        dimensions: {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
        },
        styles: {
          display: styles.display,
          position: styles.position,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontFamily: styles.fontFamily,
          margin: styles.margin,
          padding: styles.padding,
        },
        attributes: Array.from(target.attributes).map(attr => ({
          name: attr.name,
          value: attr.value,
        })),
      });

      target.style.outline = '2px solid #10b981';
      setInspecting(false);
      toast.success("تم تحديد العنصر");
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, true);
    };
  }, [inspecting]);

  const startInspecting = () => {
    setInspecting(true);
    setSelectedElement(null);
    setElementInfo(null);
    toast.info("انقر على أي عنصر لفحصه");
  };

  const stopInspecting = () => {
    setInspecting(false);
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.style.outlineOffset = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ إلى الحافظة");
  };

  return (
    <div className="space-y-6 developer-tools">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crosshair className="w-5 h-5" />
              فحص المكونات
            </span>
            {inspecting ? (
              <Button variant="destructive" size="sm" onClick={stopInspecting}>
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={startInspecting}>
                <Crosshair className="w-4 h-4 ml-2" />
                ابدأ الفحص
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspecting && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                🎯 انقر على أي عنصر في الصفحة لفحصه
              </p>
            </div>
          )}

          {elementInfo && !inspecting && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-2">معلومات أساسية</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{elementInfo.tagName}</Badge>
                    {elementInfo.id && <Badge>#{elementInfo.id}</Badge>}
                    {elementInfo.className && (
                      <Badge variant="secondary">
                        .{typeof elementInfo.className === 'string'
                          ? elementInfo.className.split(' ')[0]
                          : 'element'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <h3 className="font-semibold mb-2">الأبعاد</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>العرض: {elementInfo.dimensions.width.toFixed(2)}px</div>
                  <div>الارتفاع: {elementInfo.dimensions.height.toFixed(2)}px</div>
                  <div>X: {elementInfo.dimensions.x.toFixed(2)}px</div>
                  <div>Y: {elementInfo.dimensions.y.toFixed(2)}px</div>
                </div>
              </div>

              {/* Styles */}
              <div>
                <h3 className="font-semibold mb-2">الأنماط</h3>
                <div className="space-y-1 text-sm font-mono">
                  {Object.entries(elementInfo.styles).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">{key}:</span>
                      <span 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => copyToClipboard(value as string)}
                      >
                        {value as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attributes */}
              {elementInfo.attributes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">الخصائص</h3>
                  <div className="space-y-1 text-sm font-mono">
                    {elementInfo.attributes.map((attr: any, index: number) => (
                      <div key={index} className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">{attr.name}:</span>
                        <span
                          className="cursor-pointer hover:text-primary max-w-xs truncate"
                          onClick={() => copyToClipboard(attr.value)}
                        >
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={startInspecting}
              >
                فحص عنصر آخر
              </Button>
            </div>
          )}

          {!elementInfo && !inspecting && (
            <div className="text-center py-8 text-muted-foreground">
              <Crosshair className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>انقر على "ابدأ الفحص" للبدء</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
