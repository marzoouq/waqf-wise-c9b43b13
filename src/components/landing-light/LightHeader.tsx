/**
 * مكون Header للصفحة الخفيفة
 */
import { Link } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";

export function LightHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50" role="banner">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="التنقل الرئيسي">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="منصة الوقف - الصفحة الرئيسية"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">وقف</span>
          </Link>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            تسجيل الدخول
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
