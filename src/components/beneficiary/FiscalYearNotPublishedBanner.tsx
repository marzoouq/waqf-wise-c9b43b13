import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, Calendar } from "lucide-react";
import { useFiscalYearPublishInfo, useFiscalYearsList } from "@/hooks/fiscal-years";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function FiscalYearNotPublishedBanner() {
  const { activeFiscalYear, isCurrentYearPublished } = useFiscalYearPublishInfo();
  const { fiscalYears } = useFiscalYearsList();
  
  // جلب السنوات المنشورة
  const publishedYears = fiscalYears.filter(fy => fy.is_published);

  // إذا كانت السنة الحالية منشورة، لا نعرض البانر
  if (isCurrentYearPublished || !activeFiscalYear) {
    return null;
  }

  const lastPublishedYear = publishedYears[0];

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        السنة المالية الحالية غير منشورة بعد
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="h-3 w-3" />
          <span>
            {activeFiscalYear.name} ({format(new Date(activeFiscalYear.start_date), "yyyy/MM/dd", { locale: ar })} - {format(new Date(activeFiscalYear.end_date), "yyyy/MM/dd", { locale: ar })})
          </span>
        </div>
        {lastPublishedYear && (
          <p className="mt-2 text-sm">
            آخر سنة منشورة: <strong>{lastPublishedYear.name}</strong>
          </p>
        )}
        <p className="mt-1 text-sm">
          سيتم نشر تفاصيل العقود والإيجارات والمصروفات بعد اعتماد الناظر.
          التوزيعات تظهر فور اعتمادها.
        </p>
      </AlertDescription>
    </Alert>
  );
}
