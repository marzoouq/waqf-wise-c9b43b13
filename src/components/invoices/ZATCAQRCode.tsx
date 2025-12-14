import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle } from "lucide-react";
import { generateZATCAQRData, type ZATCAInvoiceData } from "@/lib/zatca";
import { toast } from "sonner";

interface ZATCAQRCodeProps {
  data: ZATCAInvoiceData;
  size?: number;
  className?: string;
}

export const ZATCAQRCode = ({ data, size = 256, className }: ZATCAQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base64Data = generateZATCAQRData(data);
    setQrData(base64Data);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        base64Data,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            toast.error("فشل في إنشاء رمز QR");
          }
        }
      );
    }
  }, [data, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `zatca-qr-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("تم تحميل رمز QR بنجاح");
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      toast.success("تم نسخ البيانات إلى الحافظة");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل في النسخ إلى الحافظة");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Coat_of_arms_of_Saudi_Arabia.svg/120px-Coat_of_arms_of_Saudi_Arabia.svg.png" 
            alt="ZATCA Logo" 
            className="w-8 h-8"
          />
          رمز QR للفاتورة الإلكترونية
        </CardTitle>
        <CardDescription>
          متوافق مع معايير هيئة الزكاة والضريبة والجمارك (ZATCA)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-background rounded-lg border-2 border-border">
          <canvas ref={canvasRef} />
        </div>

        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 ms-2" />
            تحميل
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 ms-2" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 ms-2" />
                نسخ البيانات
              </>
            )}
          </Button>
        </div>

        <div className="w-full p-3 bg-muted rounded-lg text-xs font-mono break-all">
          <p className="text-muted-foreground mb-1">Base64 Data:</p>
          <p className="select-all">{qrData}</p>
        </div>

        <div className="w-full space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold">محتويات الرمز:</p>
          <ul className="space-y-1">
            <li>• اسم البائع: {data.sellerName}</li>
            <li>• رقم التسجيل الضريبي: {data.sellerVatNumber}</li>
            <li>• تاريخ الفاتورة: {new Date(data.invoiceDate).toLocaleDateString('ar-SA')}</li>
            <li>• إجمالي الفاتورة: {data.invoiceTotal} ريال</li>
            <li>• ضريبة القيمة المضافة: {data.vatTotal} ريال</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
