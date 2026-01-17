/**
 * Financial Term Tooltip - مكون التوضيح للمصطلحات المالية
 * 
 * يعرض للمستخدم معلومات توضيحية عن المصطلحات المالية:
 * - اسم المصطلح
 * - تعريفه
 * - مصدر البيانات
 * 
 * @version 1.0.0
 */

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FINANCIAL_TERMS, type FinancialTermKey } from "@/lib/financial-terms";

interface FinancialTermTooltipProps {
  /** مفتاح المصطلح من القاموس الموحد */
  term: FinancialTermKey;
  /** المحتوى الذي سيُعرض (عادة اسم المصطلح) */
  children: ReactNode;
  /** إظهار أيقونة المعلومات */
  showIcon?: boolean;
}

export function FinancialTermTooltip({
  term,
  children,
  showIcon = false,
}: FinancialTermTooltipProps) {
  const termData = FINANCIAL_TERMS[term];

  if (!termData) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/40">
            {children}
            {showIcon && <Info className="h-3 w-3 text-muted-foreground" />}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 text-right"
          dir="rtl"
        >
          <div className="space-y-2">
            <p className="font-bold text-foreground">{termData.ar}</p>
            <p className="text-sm text-muted-foreground">{termData.description}</p>
            <div className="pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">المصدر:</span> {termData.source}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FinancialTermTooltip;
