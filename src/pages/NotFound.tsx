import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

const NotFound = () => {
  const location = useLocation();

  return (
    <PageErrorBoundary pageName="الصفحة غير موجودة">
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:text-primary-hover">
            Return to Home
          </a>
        </div>
      </div>
    </PageErrorBoundary>
  );
};

export default NotFound;
