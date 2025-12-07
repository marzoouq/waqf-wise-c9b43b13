/**
 * TabContentWrapper - مكون موحد لعرض محتوى التبويبات مع التحقق من الصلاحيات
 */

import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface TabContentWrapperProps {
  activeTab: string;
  tabKey: string;
  isVisible: boolean;
  children: ReactNode;
}

export function TabContentWrapper({
  activeTab,
  tabKey,
  isVisible,
  children,
}: TabContentWrapperProps) {
  if (activeTab !== tabKey) return null;

  if (!isVisible) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
