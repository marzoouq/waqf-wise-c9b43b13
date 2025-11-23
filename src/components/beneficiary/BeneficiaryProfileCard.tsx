import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, MessageSquare, Lock, Clock } from "lucide-react";
import { Beneficiary } from "@/types/beneficiary";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { BeneficiarySettingsDropdown } from "./BeneficiarySettingsDropdown";
import { NotificationsBell } from "./NotificationsBell";
import { SystemHealthIndicator } from "./SystemHealthIndicator";

interface BeneficiaryProfileCardProps {
  beneficiary: Beneficiary;
  onMessages: () => void;
  onChangePassword: () => void;
}

export function BeneficiaryProfileCard({ 
  beneficiary, 
  onMessages, 
  onChangePassword 
}: BeneficiaryProfileCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return name.charAt(0) + (name.charAt(1) || "");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "نشط":
      case "active":
        return "default";
      case "معلق":
      case "suspended":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "أبناء": "bg-info-light text-info border-info/20",
      "بنات": "bg-accent-light text-accent border-accent/20",
      "زوجات": "bg-secondary text-secondary-foreground border-secondary/20",
      "خيرية": "bg-success-light text-success border-success/20",
    };
    return colors[category] || "bg-muted";
  };

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg">
      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-md">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {getInitials(beneficiary.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Main Info */}
          <div className="flex-1 text-center md:text-right space-y-3">
            {/* التاريخ والوقت والإشعارات */}
            <div className="flex items-center justify-center md:justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">
                    {format(currentTime, "d MMM yyyy", { locale: ar })}
                  </span>
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  <span className="text-xs font-mono font-semibold">
                    {format(currentTime, "HH:mm:ss")}
                  </span>
                </div>

                {/* التاريخ والوقت للموبايل */}
                <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-mono font-semibold">
                    {format(currentTime, "HH:mm")}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* مؤشر صحة النظام */}
                <SystemHealthIndicator />
                
                {/* أيقونة الإشعارات */}
                <NotificationsBell />
              </div>
            </div>
            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
              {beneficiary.full_name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="outline" className="text-sm font-medium border-primary/30">
                رقم العضوية: {beneficiary.beneficiary_number || "غير محدد"}
              </Badge>
              <Badge className={getCategoryColor(beneficiary.category)}>
                {beneficiary.category}
              </Badge>
              <Badge variant={getStatusColor(beneficiary.status)}>
                {beneficiary.status}
              </Badge>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium">{beneficiary.phone}</span>
              </div>
              
              {beneficiary.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium">{beneficiary.email}</span>
                </div>
              )}
              
              {beneficiary.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{beneficiary.city}</span>
                </div>
              )}
              
              {beneficiary.date_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {format(new Date(beneficiary.date_of_birth), "dd/MM/yyyy", { locale: ar })}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <BeneficiarySettingsDropdown 
                beneficiary={beneficiary} 
                onChangePassword={onChangePassword} 
              />
              <Button 
                size="sm" 
                onClick={onMessages}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <MessageSquare className="h-4 w-4 ml-2" />
                الرسائل
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
