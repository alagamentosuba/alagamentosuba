import { Star, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
    }
    window.open('https://wa.me/553288190835?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20energia%20solar', '_blank');
  };
  const testimonials = [
    {
      name: "Maria Santos",
      location: "São Paulo, SP",
      text: "Quando vi a primeira conta de luz depois da instalação, chorei de emoção. Finalmente posso respirar financeiramente e ainda deixar um mundo melhor para meus filhos.",
      rating: 5,
      savings: "R$ 450/mês",
    },
    {
      name: "Carlos Oliveira",
      location: "Rio de Janeiro, RJ",
      text: "Minha empresa economiza quase R$ 3 mil por mês. É dinheiro que posso investir no crescimento do negócio e nos meus colaboradores. Transformou tudo!",
      rating: 5,
      savings: "R$ 2.800/mês",
    },
    {
      name: "Ana Paula Costa",
      location: "Belo Horizonte, MG",
      text: "Tinha medo de ser complicado, mas foi surpreendentemente fácil. Hoje, cada vez que olho para os painéis no teto, sinto orgulho de estar fazendo a coisa certa.",
      rating: 5,
      savings: "R$ 320/mês",
    },
  ];

  return (
    <section id="depoimentos" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-neutral-600">
            Mais de 500 clientes satisfeitos economizando todos os meses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-8 hover:shadow-lg transition-shadow relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary opacity-20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-solar-yellow text-solar-yellow" />
                ))}
              </div>

              <p className="text-neutral-700 mb-6 leading-relaxed">{testimonial.text}</p>

              <div className="pt-6 border-t border-border">
                <div className="font-semibold text-foreground mb-1">{testimonial.name}</div>
                <div className="text-sm text-neutral-600 mb-3">{testimonial.location}</div>
                <div className="inline-flex items-center gap-2 bg-solar-green-light text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingDown className="w-4 h-4" />
                  Economia: {testimonial.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emotional CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Sua história de economia começa aqui
          </h3>
          <p className="text-lg text-neutral-600 mb-6">
            Centenas de famílias já estão vivendo com mais tranquilidade. Você pode ser a próxima!
          </p>
          <Button size="lg" onClick={handleCTAClick} className="group">
            Quero minha simulação gratuita
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const TrendingDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    />
  </svg>
);

export default Testimonials;
