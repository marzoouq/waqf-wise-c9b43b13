/**
 * WelcomeCard Component
 * بطاقة ترحيب ذكية مع ملخص الحالة
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Sunset, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Beneficiary } from "@/types/beneficiary";
import { format, arLocale as ar } from "@/lib/date";
import { motion } from "framer-motion";

interface WelcomeCardProps {
  beneficiary: Beneficiary;
}

export function WelcomeCard({ beneficiary }: WelcomeCardProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "صباح الخير", icon: Sun, color: "text-amber-500" };
    } else if (hour >= 12 && hour < 17) {
      return { text: "مساء الخير", icon: Sunset, color: "text-orange-500" };
    } else {
      return { text: "مساء الخير", icon: Moon, color: "text-indigo-500" };
    }
  }, []);

  const firstName = useMemo(() => {
    return beneficiary.full_name.split(" ")[0];
  }, [beneficiary.full_name]);

  const currentDate = useMemo(() => new Date(), []);
  const GreetingIcon = greeting.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* الترحيب */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <GreetingIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${greeting.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    {greeting.text}، {firstName}
                  </h2>
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                </div>
                <p className="text-primary-foreground/80 text-sm sm:text-base mt-1">
                  مرحباً بك في بوابة المستفيد
                </p>
              </div>
            </div>

            {/* معلومات سريعة */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 me-1.5" />
                {format(currentDate, "EEEE، d MMMM yyyy", { locale: ar })}
              </Badge>
              
              <Badge 
                variant="secondary" 
                className={`border-0 backdrop-blur-sm ${
                  beneficiary.status === 'نشط' || beneficiary.status === 'active'
                    ? 'bg-emerald-500/30 text-white'
                    : 'bg-amber-500/30 text-white'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 me-1.5" />
                {beneficiary.status}
              </Badge>
            </div>
          </div>

          {/* شريط الحالة السفلي */}
          <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/70">الفئة:</span>
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                {beneficiary.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/70">رقم العضوية:</span>
              <span className="font-semibold">{beneficiary.beneficiary_number || "—"}</span>
            </div>
            {beneficiary.family_name && (
              <div className="flex items-center gap-2">
                <span className="text-primary-foreground/70">العائلة:</span>
                <span className="font-semibold">{beneficiary.family_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
