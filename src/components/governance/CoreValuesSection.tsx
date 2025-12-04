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
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    icon: Heart,
    title: "النزاهة",
    description: "التعامل بصدق وإخلاص في جميع الأعمال",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    icon: Eye,
    title: "الشفافية",
    description: "الإفصاح عن المعلومات للمستفيدين والجهات المعنية",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    icon: Scale,
    title: "العدالة",
    description: "المساواة في توزيع الحقوق والمستحقات",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];

export function CoreValuesSection() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
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
                  <Icon className="h-6 w-6 text-white" />
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
