/**
 * شعار وضع المعاينة - يظهر للناظر عند معاينة لوحة المستفيد
 */

import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, ArrowRight, X } from "lucide-react";

interface PreviewModeBannerProps {
  beneficiaryName?: string;
  onClose?: () => void;
}

export function PreviewModeBanner({ beneficiaryName, onClose }: PreviewModeBannerProps) {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleClose = () => {
    // إزالة معاملات المعاينة
    setSearchParams(params => {
      params.delete('preview');
      params.delete('beneficiary_id');
      return params;
    });
    onClose?.();
  };

  const handleBackToNazer = () => {
    navigate('/nazer-dashboard');
  };

  return (
    <Alert className="bg-warning/10 border-warning/30 dark:bg-warning/10 dark:border-warning/30 mb-4">
      <Eye className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning dark:text-warning">وضع المعاينة</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-warning/80 dark:text-warning/80">
          أنت تشاهد لوحة المستفيد{beneficiaryName && `: ${beneficiaryName}`}
        </span>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToNazer}
            className="border-warning/50 hover:bg-warning/20 dark:border-warning/50 dark:hover:bg-warning/20"
          >
            <ArrowRight className="h-4 w-4 ms-1" />
            العودة للوحة الناظر
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-warning hover:text-warning/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
