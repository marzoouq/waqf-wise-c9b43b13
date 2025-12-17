import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OCRConfidenceIndicatorProps {
  confidence: number;
  fieldName: string;
  className?: string;
}

export const OCRConfidenceIndicator = ({ 
  confidence, 
  fieldName,
  className 
}: OCRConfidenceIndicatorProps) => {
  const getConfidenceLevel = () => {
    if (confidence >= 90) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  };

  const level = getConfidenceLevel();

  const config = {
    high: {
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      label: 'ثقة عالية',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      label: 'ثقة متوسطة - يُنصح بالمراجعة',
    },
    low: {
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      label: 'ثقة منخفضة - يجب المراجعة',
    },
  };

  const { icon: Icon, color, bgColor, borderColor, label } = config[level];

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border text-sm",
        bgColor,
        borderColor,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", color)} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{fieldName}</span>
          <span className={cn("font-bold", color)}>{confidence}%</span>
        </div>
        <span className={cn("text-xs", color)}>{label}</span>
      </div>
    </div>
  );
};
