/**
 * QuickActionsGrid Component
 * شبكة الإجراءات السريعة للمحاسب
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ACCOUNTANT_QUICK_ACTIONS } from "./config";

export function QuickActionsGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4">
      {ACCOUNTANT_QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.path + action.label}
            variant="outline"
            className="w-full text-xs sm:text-sm"
            onClick={() => navigate(action.path)}
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
