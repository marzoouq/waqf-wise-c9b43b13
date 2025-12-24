/**
 * مكون Footer للصفحة الخفيفة
 */
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export function LightFooter() {
  return (
    <footer className="py-8 border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">منصة الوقف</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium" aria-label="روابط التذييل">
            <Link to="/privacy" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">
              الشروط والأحكام
            </Link>
            <Link to="/contact" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded">
              اتصل بنا
            </Link>
          </nav>
          <p className="text-sm text-foreground/70 font-medium">
            © {new Date().getFullYear()} منصة الوقف. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
