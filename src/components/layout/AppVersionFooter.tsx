import { memo } from "react";
import { APP_VERSION, APP_VERSION_DATE } from "@/lib/version";

const AppVersionFooter = memo(function AppVersionFooter() {
  return (
    <footer className="text-center text-xs text-muted-foreground py-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span>الإصدار {APP_VERSION}</span>
      <span className="me-2 text-muted-foreground/70">
        ({new Date(APP_VERSION_DATE).toLocaleDateString('ar-SA')})
      </span>
    </footer>
  );
});

export default AppVersionFooter;
