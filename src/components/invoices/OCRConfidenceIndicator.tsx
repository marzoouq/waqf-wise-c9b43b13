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
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'ثقة عالية',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'ثقة متوسطة - يُنصح بالمراجعة',
    },
    low: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
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
