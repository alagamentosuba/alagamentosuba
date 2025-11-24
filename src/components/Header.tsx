import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <img src={logo} alt="Solis Energia Solar Logo" className="h-12 w-12 object-contain" />
            <span className="text-xl font-bold text-foreground">Solis Energia Solar</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("sobre")}
              className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Sobre Nós
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection("beneficios")}
              className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Benefícios
            </button>
            <button
              onClick={() => scrollToSection("depoimentos")}
              className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Depoimentos
            </button>
            <Button onClick={() => scrollToSection("contato")} size="sm">
              Simular Agora
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("sobre")}
                className="text-left text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
              >
                Sobre Nós
              </button>
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="text-left text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection("beneficios")}
                className="text-left text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
              >
                Benefícios
              </button>
              <button
                onClick={() => scrollToSection("depoimentos")}
                className="text-left text-sm font-medium text-neutral-600 hover:text-primary transition-colors py-2"
              >
                Depoimentos
              </button>
              <Button onClick={() => scrollToSection("contato")} className="w-full mt-2">
                Simular Agora
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
