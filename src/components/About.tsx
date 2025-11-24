import { Award, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
    }
    window.open('https://wa.me/553288190835?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20energia%20solar', '_blank');
  };
  const features = [
    {
      icon: Shield,
      title: "Garantia Total",
      description: "25 anos de garantia nos equipamentos e 5 anos na instalação",
    },
    {
      icon: Award,
      title: "Qualidade Certificada",
      description: "Equipamentos de marcas líderes mundiais em energia solar",
    },
    {
      icon: Users,
      title: "Equipe Especializada",
      description: "Profissionais certificados e com anos de experiência",
    },
  ];

  return (
    <section id="sobre" className="py-20 lg:py-32 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Sobre Nós
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Somos especialistas em energia solar com mais de 10 anos de experiência no mercado.
            Nossa missão é tornar a energia limpa acessível para todos, combinando tecnologia de
            ponta com atendimento personalizado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-solar-green-light rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Emotional CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Você merece viver sem se preocupar com energia
          </h3>
          <p className="text-lg text-neutral-600 mb-6">
            Junte-se a centenas de famílias que já transformaram suas vidas com energia solar
          </p>
          <Button size="lg" onClick={handleCTAClick} className="group">
            Quero economizar agora
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default About;
