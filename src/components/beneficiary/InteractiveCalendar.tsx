import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface InteractiveCalendarProps {
  beneficiaryId: string;
}

export function InteractiveCalendar({ beneficiaryId }: InteractiveCalendarProps) {
  // التاريخ والوقت ثابتين عند تحميل المكون - لا نحتاج تحديث كل ثانية
  const currentDate = useMemo(() => new Date(), []);

  const formattedDate = useMemo(() => 
    format(currentDate, "EEEE، d MMMM yyyy", { locale: ar }), 
    [currentDate]
  );

  const formattedTime = useMemo(() => 
    format(currentDate, "HH:mm"), 
    [currentDate]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          التاريخ والوقت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          {/* التاريخ الميلادي */}
          <div className="flex items-center gap-3 text-center">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">التاريخ الميلادي</p>
              <p className="text-2xl font-bold">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* الساعة */}
          <div className="flex items-center gap-3 text-center">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">الوقت الحالي</p>
              <p className="text-2xl font-bold">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
