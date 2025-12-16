import { Link } from "react-router-dom";
import { Landmark, Mail, Phone, MapPin } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { label: "المميزات", href: "#features", isAnchor: true },
      { label: "كيف يعمل", href: "#how-it-works", isAnchor: true },
      { label: "الأسئلة الشائعة", href: "/faq", isAnchor: false },
    ],
    support: [
      { label: "مركز المساعدة", href: "/faq", isAnchor: false },
      { label: "تواصل معنا", href: "/contact", isAnchor: false },
      { label: "الدعم الفني", href: "/contact", isAnchor: false },
    ],
    legal: [
      { label: "سياسة الخصوصية", href: "/privacy", isAnchor: false },
      { label: "شروط الاستخدام", href: "/terms", isAnchor: false },
      { label: "سياسة الأمان", href: "/security-policy", isAnchor: false },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">منصة الوقف</h3>
                <p className="text-xs text-muted-foreground">
                  إدارة الأوقاف الإلكترونية
                </p>
              </div>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              منصة متكاملة لإدارة الأوقاف الإسلامية بكفاءة وشفافية، تدعم توزيع
              الغلة وإدارة المستفيدين والمحاسبة المتقدمة.
            </p>
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <a
                href="mailto:info@waqf.sa"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                info@waqf.sa
              </a>
              <a
                href="tel:+966500000000"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                +966 50 000 0000
              </a>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                الرياض، المملكة العربية السعودية
              </div>
            </div>
          </div>

          {/* Links - Platform */}
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">المنصة</h4>
            <ul className="space-y-2 sm:space-y-3">
              {links.platform.map((link) => (
                <li key={link.label}>
                  {link.isAnchor ? (
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Support */}
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">الدعم</h4>
            <ul className="space-y-2 sm:space-y-3">
              {links.support.map((link) => (
                <li key={link.label}>
                  {link.isAnchor ? (
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Legal */}
          <div>
            <h4 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">قانوني</h4>
            <ul className="space-y-2 sm:space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  {link.isAnchor ? (
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © {currentYear} منصة الوقف. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
