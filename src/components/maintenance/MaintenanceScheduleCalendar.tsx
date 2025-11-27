import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, Wrench } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MaintenanceSchedule {
  id: string;
  schedule_name: string;
  maintenance_type: string;
  category: string;
  next_maintenance_date: string;
  priority: string;
  is_active: boolean;
}

interface MaintenanceScheduleCalendarProps {
  schedules: MaintenanceSchedule[];
  onAddSchedule?: () => void;
  onScheduleClick?: (schedule: MaintenanceSchedule) => void;
}

export const MaintenanceScheduleCalendar = ({ 
  schedules, 
  onAddSchedule,
  onScheduleClick 
}: MaintenanceScheduleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // تصفية الصيانات النشطة فقط
  const activeSchedules = schedules.filter(s => s.is_active);

  // الحصول على الصيانات لليوم المحدد
  const getSchedulesForDay = (date: Date) => {
    return activeSchedules.filter(schedule => 
      isSameDay(new Date(schedule.next_maintenance_date), date)
    );
  };

  // ألوان الأولويات
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عاجلة':
        return 'bg-destructive text-destructive-foreground';
      case 'عالية':
        return 'bg-warning text-warning-foreground';
      case 'متوسطة':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              جدول الصيانة الدورية
            </CardTitle>
            {onAddSchedule && (
              <Button onClick={onAddSchedule} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                جدولة صيانة
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* التنقل في الشهور */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              الشهر السابق
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy", { locale: ar })}
            </h3>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              الشهر التالي
            </Button>
          </div>

          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* أيام الشهر */}
          <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              const hasSchedules = daySchedules.length > 0;
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[80px] p-2 rounded-lg border transition-colors",
                    today && "border-primary bg-primary/5",
                    hasSchedules && "bg-accent/50 hover:bg-accent cursor-pointer",
                    !hasSchedules && "hover:bg-accent/30"
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      today && "text-primary font-bold"
                    )}>
                      {format(day, "d")}
                    </div>

                    {hasSchedules && (
                      <div className="space-y-1 flex-1">
                        {daySchedules.slice(0, 2).map((schedule) => (
                          <div
                            key={schedule.id}
                            onClick={() => onScheduleClick?.(schedule)}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              getPriorityColor(schedule.priority)
                            )}
                            title={schedule.schedule_name}
                          >
                            <div className="flex items-center gap-1">
                              <Wrench className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{schedule.category}</span>
                            </div>
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{daySchedules.length - 2} أخرى
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* قائمة الصيانات القادمة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            الصيانات المجدولة هذا الشهر ({activeSchedules.filter(s => 
              isSameMonth(new Date(s.next_maintenance_date), currentDate)
            ).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeSchedules
              .filter(s => isSameMonth(new Date(s.next_maintenance_date), currentDate))
              .sort((a, b) => 
                new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime()
              )
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      getPriorityColor(schedule.priority)
                    )}>
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{schedule.schedule_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.category} - {schedule.maintenance_type}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(schedule.next_maintenance_date), "dd MMM", { locale: ar })}
                    </Badge>
                  </div>
                </div>
              ))}

            {activeSchedules.filter(s => 
              isSameMonth(new Date(s.next_maintenance_date), currentDate)
            ).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد صيانات مجدولة لهذا الشهر
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
