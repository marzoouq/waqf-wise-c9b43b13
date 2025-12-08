import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, Menu, X } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "المميزات", href: "#features" },
    { label: "عن المنصة", href: "#stats" },
    { label: "كيف يعمل", href: "#how-it-works" },
  ];

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const sectionId = href.replace("#", "");
    
    // إذا لم نكن في الصفحة الرئيسية، انتقل إليها أولاً
    if (location.pathname !== "/") {
      navigate("/" + href);
      setIsMenuOpen(false);
      return;
    }
    
    // إذا كنا في الصفحة الرئيسية، انتقل للقسم مباشرة
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    
    setIsMenuOpen(false);
  }, [location.pathname, navigate]);

  const toggleMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-lg sm:text-xl font-bold text-foreground">منصة الوقف</span>
              <p className="text-xs text-muted-foreground">إدارة الأوقاف الإلكترونية</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 lg:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" className="shadow-lg shadow-primary/25">
                تسجيل الدخول
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors touch-manipulation"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-[400px] pb-4 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors active:bg-accent/80"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-4 px-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">
                  تسجيل الدخول
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
