import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface InteractiveCalendarProps {
  beneficiaryId: string;
}

export function InteractiveCalendar({ beneficiaryId }: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: upcomingPayments } = useQuery({
    queryKey: ["upcoming-payments", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("payment_date, amount, description")
        .eq("beneficiary_id", beneficiaryId)
        .gte("payment_date", new Date().toISOString())
        .order("payment_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!beneficiaryId,
  });

  const { data: disclosures } = useQuery({
    queryKey: ["upcoming-disclosures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annual_disclosures")
        .select("disclosure_date, year, waqf_name")
        .gte("disclosure_date", new Date().toISOString())
        .order("disclosure_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // تحديد التواريخ المميزة في التقويم
  const markedDates = [
    ...(upcomingPayments?.map((p) => new Date(p.payment_date)) || []),
    ...(disclosures?.map((d) => new Date(d.disclosure_date)) || []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* التقويم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            التقويم والمواعيد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            locale={ar}
            modifiers={{
              marked: markedDates,
            }}
            modifiersStyles={{
              marked: {
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                borderRadius: "50%",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* المواعيد القادمة */}
      <Card>
        <CardHeader>
          <CardTitle>المواعيد القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* مواعيد المدفوعات */}
            {upcomingPayments && upcomingPayments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  المدفوعات القادمة
                </h4>
                <div className="space-y-2">
                  {upcomingPayments.slice(0, 3).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-sm font-medium">{payment.description || "دفعة"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), "PPP", { locale: ar })}
                        </p>
                      </div>
                      <Badge variant="outline">{payment.amount.toLocaleString("ar-SA")} ر.س</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* مواعيد الإفصاحات */}
            {disclosures && disclosures.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  الإفصاحات القادمة
                </h4>
                <div className="space-y-2">
                  {disclosures.map((disclosure, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-sm font-medium">إفصاح سنة {disclosure.year}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(disclosure.disclosure_date), "PPP", { locale: ar })}
                        </p>
                      </div>
                      <Badge>قريباً</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!upcomingPayments || upcomingPayments.length === 0) &&
              (!disclosures || disclosures.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد مواعيد قادمة حالياً
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
