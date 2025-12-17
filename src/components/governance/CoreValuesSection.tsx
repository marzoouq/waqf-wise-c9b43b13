/**
 * مكون القيم الأساسية للوقف
 * الأمانة - النزاهة - الشفافية - العدالة
 */

import { Shield, Eye, Scale, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const coreValues = [
  {
    icon: Shield,
    title: "الأمانة",
    description: "الالتزام بحفظ أصول الوقف وحمايتها",
    color: "from-info to-info/80",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
  },
  {
    icon: Heart,
    title: "النزاهة",
    description: "التعامل بصدق وإخلاص في جميع الأعمال",
    color: "from-destructive to-destructive/80",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  {
    icon: Eye,
    title: "الشفافية",
    description: "الإفصاح عن المعلومات للمستفيدين والجهات المعنية",
    color: "from-success to-success/80",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
  },
  {
    icon: Scale,
    title: "العدالة",
    description: "المساواة في توزيع الحقوق والمستحقات",
    color: "from-primary to-primary/80",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
];

export function CoreValuesSection() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        القيم الأساسية
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {coreValues.map((value) => {
          const Icon = value.icon;
          return (
            <Card
              key={value.title}
              className={`${value.bgColor} ${value.borderColor} border hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4 text-center">
                <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-1">{value.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
