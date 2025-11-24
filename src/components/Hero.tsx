import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-solar.jpg";

const Hero = () => {
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
    }
    window.open('https://wa.me/553288190835?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20energia%20solar', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 lg:pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Painéis solares modernos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Imagine nunca mais se preocupar com a{" "}
            <span className="text-primary">conta de luz</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 mb-8 leading-relaxed">
            Famílias como a sua estão economizando até <span className="font-bold text-foreground">R$ 800 por mês</span> e protegendo o futuro dos seus filhos. 
            Não é só economia — é <span className="font-semibold">liberdade financeira e paz de espírito</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={handleCTAClick} className="group">
              Simule seu sistema
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleCTAClick}>
              Fale com um especialista
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">95%</div>
              <div className="text-sm text-neutral-600">Economia na conta de luz</div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">25+</div>
              <div className="text-sm text-neutral-600">Anos de durabilidade</div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-neutral-600">Projetos concluídos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
