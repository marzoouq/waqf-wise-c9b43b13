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
    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 mb-4">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">وضع المعاينة</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-amber-700 dark:text-amber-300">
          أنت تشاهد لوحة المستفيد{beneficiaryName && `: ${beneficiaryName}`}
        </span>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToNazer}
            className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
          >
            <ArrowRight className="h-4 w-4 ml-1" />
            العودة للوحة الناظر
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-amber-600 hover:text-amber-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
