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
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* الترحيب */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
                <GreetingIcon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 ${greeting.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">
                    {greeting.text}، {firstName}
                  </h2>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300 animate-pulse shrink-0" />
                </div>
                <p className="text-primary-foreground/80 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
                  مرحباً بك في بوابة المستفيد
                </p>
              </div>
            </div>

            {/* معلومات سريعة - مخفية على الشاشات الصغيرة جداً */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0 backdrop-blur-sm text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 me-1 sm:me-1.5" />
                <span className="hidden xs:inline">{format(currentDate, "EEEE، d MMMM yyyy", { locale: ar })}</span>
                <span className="xs:hidden">{format(currentDate, "d MMM", { locale: ar })}</span>
              </Badge>
              
              <Badge 
                variant="secondary" 
                className={`border-0 backdrop-blur-sm text-xs sm:text-sm ${
                  beneficiary.status === 'نشط' || beneficiary.status === 'active'
                    ? 'bg-emerald-500/30 text-white'
                    : 'bg-amber-500/30 text-white'
                }`}
              >
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 me-1 sm:me-1.5" />
                {beneficiary.status}
              </Badge>
            </div>
          </div>

          {/* شريط الحالة السفلي - محسّن للجوال */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-primary-foreground/70">الفئة:</span>
              <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs">
                {beneficiary.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-primary-foreground/70">رقم العضوية:</span>
              <span className="font-semibold">{beneficiary.beneficiary_number || "—"}</span>
            </div>
            {beneficiary.family_name && (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
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
