import { Link } from "react-router-dom";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

const NotFound = () => {
  return (
    <PageErrorBoundary pageName="الصفحة غير موجودة">
      <main className="flex min-h-screen items-center justify-center bg-background overflow-x-hidden">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">الصفحة غير موجودة</p>
          <Link to="/redirect" className="text-primary underline hover:text-primary/80">
            العودة للرئيسية
          </Link>
        </div>
      </main>
    </PageErrorBoundary>
  );
};

export default NotFound;
