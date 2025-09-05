import { Card, CardContent } from "@/components/ui/card"
import { Brain, Zap, Shield, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Intelligent Understanding",
    description: "Advanced AI that comprehends context and nuance, providing accurate answers every time.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Lightning-fast answers that keep your customers engaged and satisfied.",
  },
  {
    icon: Shield,
    title: "Always Learning",
    description: "Continuously improves from interactions to provide better support over time.",
  },
  {
    icon: BarChart3,
    title: "Analytics Insights",
    description: "Detailed analytics to understand customer needs and optimize your FAQ content.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Why Choose AskNest?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Built for modern businesses that value efficiency, accuracy, and exceptional customer experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}