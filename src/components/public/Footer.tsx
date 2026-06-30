import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/home#features" },
    { label: "Pricing", href: "/price" },
    { label: "How It Works", href: "/home#how-it-works" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/home" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">D</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">DriveUnity</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your Google Drive into an intelligent, searchable workspace.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              {["X", "Li", "Gh"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DriveUnity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
