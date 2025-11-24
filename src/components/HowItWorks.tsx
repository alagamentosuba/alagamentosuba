import { FileSearch, Wrench, Zap, CheckCircle, ArrowRight } from "lucide-react";
import installationImage from "@/assets/installation-process.jpg";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
    }
    window.open('https://wa.me/553288190835?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20energia%20solar', '_blank');
  };
  const steps = [
    {
      icon: FileSearch,
      title: "1. Análise e Projeto",
      description:
        "Avaliamos seu consumo de energia e projetamos o sistema ideal para suas necessidades",
    },
    {
      icon: Wrench,
      title: "2. Instalação Profissional",
      description:
        "Nossa equipe certificada instala os painéis com os mais altos padrões de qualidade",
    },
    {
      icon: Zap,
      title: "3. Ativação e Monitoramento",
      description:
        "Conectamos seu sistema à rede e você começa a economizar imediatamente",
    },
    {
      icon: CheckCircle,
      title: "4. Suporte Contínuo",
      description:
        "Acompanhamos o desempenho do sistema e oferecemos suporte sempre que necessário",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Como Funciona
          </h2>
          <p className="text-lg text-neutral-600">
            Do primeiro contato até a economia na sua conta de luz, todo o processo é simples e
            transparente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-4 group hover:translate-x-2 transition-transform"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-solar-green-light rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-neutral-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative lg:order-first">
            <img
              src={installationImage}
              alt="Processo de instalação de painéis solares"
              className="rounded-2xl shadow-lg w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl max-w-xs">
              <p className="text-sm font-medium">Processo completo em</p>
              <p className="text-3xl font-bold">30-45 dias</p>
            </div>
          </div>
        </div>

        {/* Emotional CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <div className="bg-foreground text-background rounded-2xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Em apenas 30 dias, você pode estar economizando
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Não deixe seu dinheiro escapar pela conta de luz. Cada mês que passa é dinheiro perdido.
              </p>
              <Button size="lg" onClick={handleCTAClick} variant="secondary" className="group">
                Começar minha economia agora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
