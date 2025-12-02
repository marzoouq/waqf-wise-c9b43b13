import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  User,
  FileText,
  CreditCard,
  Building2,
  Users,
  Landmark,
  Shield,
  DollarSign,
  CreditCard as LoanIcon,
  Menu,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tab?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "نظرة عامة", icon: TrendingUp, tab: "overview" },
  { id: "profile", label: "الملف الشخصي", icon: User, tab: "profile" },
  { id: "requests", label: "الطلبات", icon: FileText, tab: "requests" },
  { id: "distributions", label: "التوزيعات", icon: DollarSign, tab: "distributions" },
  { id: "statements", label: "كشف الحساب", icon: CreditCard, tab: "statements" },
  { id: "properties", label: "العقارات", icon: Building2, tab: "properties" },
  { id: "family", label: "العائلة", icon: Users, tab: "family" },
  { id: "waqf", label: "الوقف", icon: Landmark, tab: "waqf" },
  { id: "governance", label: "الحوكمة", icon: Shield, tab: "governance" },
  { id: "budgets", label: "الميزانيات", icon: DollarSign, tab: "budgets" },
  { id: "loans", label: "القروض", icon: LoanIcon, tab: "loans" },
];

interface BeneficiarySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  beneficiaryName?: string;
}

/**
 * القائمة الجانبية للمستفيدين
 * - على سطح المكتب: قائمة ثابتة على اليمين
 * - على الجوال: Sheet منزلقة بزر قائمة
 */
export function BeneficiarySidebar({ activeTab, onTabChange, beneficiaryName }: BeneficiarySidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleItemClick = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false); // إغلاق القائمة على الجوال بعد الاختيار
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {beneficiaryName || "المستفيد"}
            </h3>
            <p className="text-xs text-muted-foreground">بوابة الوقف</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => item.tab && handleItemClick(item.tab)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent/50 active:bg-accent",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                <span className="flex-1 text-right">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-4 text-xs text-center text-muted-foreground">
        <p>منصة إدارة الوقف</p>
        <p className="mt-1">الإصدار 2.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Sheet with trigger button */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 right-4 z-40 lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>قائمة التنقل</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 lg:border-l lg:bg-card">
        <SidebarContent />
      </aside>
    </>
  );
}
