import { TrendingDown, Leaf, Home, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Benefits = () => {
const handleCTAClick = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead');
  }
  window.open('https://wa.me/553288190835?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20energia%20solar', '_blank');
};
  const benefits = [
    {
      icon: TrendingDown,
      title: "Economia Imediata",
      description: "Reduza sua conta de luz em até 95% logo após a instalação",
      stat: "95%",
      statLabel: "de economia",
    },
    {
      icon: Leaf,
      title: "Sustentabilidade",
      description: "Contribua para um planeta mais limpo com energia 100% renovável",
      stat: "0kg",
      statLabel: "de CO₂ emitido",
    },
    {
      icon: Home,
      title: "Valorização do Imóvel",
      description: "Imóveis com energia solar valorizam até 30% no mercado",
      stat: "+30%",
      statLabel: "de valorização",
    },
    {
      icon: Sun,
      title: "Independência Energética",
      description: "Proteja-se contra os aumentos nas tarifas de energia",
      stat: "25+",
      statLabel: "anos de economia",
    },
  ];

  return (
    <section id="beneficios" className="py-20 lg:py-32 bg-gradient-to-b from-neutral-50 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Benefícios da Energia Solar
          </h2>
          <p className="text-lg text-neutral-600">
            Invista no futuro com uma solução que combina economia, sustentabilidade e
            independência energética
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-border"
            >
              <div className="w-14 h-14 bg-solar-green-light rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-neutral-600 mb-6">{benefit.description}</p>
              <div className="pt-6 border-t border-border">
                <div className="text-3xl font-bold text-primary mb-1">{benefit.stat}</div>
                <div className="text-sm text-neutral-600">{benefit.statLabel}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Emotional CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <div className="bg-gradient-to-br from-solar-green-light via-background to-solar-yellow/10 rounded-2xl p-8 lg:p-12 border-2 border-primary/20">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Proteja sua família e o planeta ao mesmo tempo
            </h3>
            <p className="text-lg text-neutral-600 mb-6">
              Enquanto você economiza, está construindo um futuro melhor para seus filhos. É o investimento mais inteligente que você pode fazer.
            </p>
            <Button size="lg" onClick={handleCTAClick} className="group">
              Quero fazer parte dessa mudança
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
