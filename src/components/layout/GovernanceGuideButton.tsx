import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { memo } from "react";

export const GovernanceGuideButton = memo(function GovernanceGuideButton() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
            onClick={() => navigate("/governance/guide")}
            aria-label="الدليل الإرشادي والحوكمة"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-sm shadow-red-500/25">
              <ScrollText className="h-4 w-4 text-primary-foreground" />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>الدليل الإرشادي والحوكمة</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
