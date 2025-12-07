import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NAZER_QUICK_ACTIONS } from "./config";

export default function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {NAZER_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={`action-${action.label}`}
                variant="outline"
                className="h-auto flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all"
                onClick={() => navigate(action.path)}
              >
                <div className={`${action.bgColor} p-2 sm:p-3 rounded-full shrink-0`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${action.color}`} />
                </div>
                <div className="text-center w-full">
                  <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">
                    {action.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
