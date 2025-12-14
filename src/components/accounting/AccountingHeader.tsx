import { Button } from "@/components/ui/button";
import { BookOpen, Building2 } from "lucide-react";
import { memo } from "react";

interface AccountingHeaderProps {
  onBankReconciliation: () => void;
}

export const AccountingHeader = memo(({ onBankReconciliation }: AccountingHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
            النظام المحاسبي
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            إدارة الحسابات والقيود المحاسبية والميزانيات
          </p>
        </div>
      </div>
      <Button 
        onClick={onBankReconciliation} 
        variant="outline" 
        size="sm"
        className="w-full sm:w-auto"
      >
        <Building2 className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">التسوية البنكية</span>
        <span className="sm:hidden">التسوية</span>
      </Button>
    </div>
  );
});

AccountingHeader.displayName = 'AccountingHeader';
