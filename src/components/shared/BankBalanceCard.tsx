import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, RefreshCw, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { productionLogger } from "@/lib/logger/production-logger";

interface BankBalanceCardProps {
  className?: string;
  compact?: boolean;
}

export function BankBalanceCard({ className, compact = false }: BankBalanceCardProps) {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  // جلب رصيد البنك من حساب النقدية والبنوك
  const { data: bankBalance, isLoading } = useQuery({
    queryKey: ["bank-balance-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name_ar, code, current_balance")
        .eq("code", "1.1.1") // حساب النقدية والبنوك
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel("bank-balance-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: "code=eq.1.1.1",
        },
        (payload) => {
          productionLogger.info("Bank balance updated", { payload });
          setLastUpdated(new Date());
          setIsLive(true);
          queryClient.invalidateQueries({ queryKey: ["bank-balance-realtime"] });
          
          // إخفاء مؤشر التحديث بعد 3 ثواني
          setTimeout(() => setIsLive(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const balance = bankBalance?.current_balance || 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* مؤشر التحديث المباشر */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-success/50 to-success animate-pulse" />
      )}
      
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2 pt-4" : ""}`}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-sm" : "text-base"}`}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Landmark className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-primary`} />
          </div>
          الرصيد البنكي
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              يتم التحديث
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Wifi className="h-3 w-3" />
              مباشر
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : ""}>
        <div className="space-y-2">
          <div className={`font-bold text-primary ${compact ? "text-2xl" : "text-3xl"}`}>
            {balance.toLocaleString("ar-SA")} ر.س
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
            </p>
          )}
          
          {!compact && (
            <p className="text-sm text-muted-foreground mt-2">
              إجمالي النقدية المتاحة في حسابات الوقف البنكية
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}