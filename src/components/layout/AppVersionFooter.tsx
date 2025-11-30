import { memo } from "react";

const AppVersionFooter = memo(function AppVersionFooter() {
  const version = import.meta.env.VITE_APP_VERSION;
  const buildTime = import.meta.env.VITE_BUILD_TIME;

  return (
    <footer className="text-center text-xs text-muted-foreground py-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <span>الإصدار {version}</span>
      {buildTime && (
        <span className="mr-2 text-muted-foreground/70">
          ({new Date(buildTime).toLocaleDateString('ar-SA')})
        </span>
      )}
    </footer>
  );
});

export default AppVersionFooter;
