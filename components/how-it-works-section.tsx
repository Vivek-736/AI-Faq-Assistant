import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Upload Your Content",
    description: "Simply upload your existing FAQ documents, knowledge base, or website content.",
    image: "/minimalist-black-and-white-document-upload-interfa.jpg",
  },
  {
    number: "02",
    title: "AI Training",
    description: "Our AI analyzes and learns from your content to understand your business context.",
    image: "/minimalist-black-and-white-ai-brain-processing-dat.jpg",
  },
  {
    number: "03",
    title: "Instant Answers",
    description: "Customers get accurate, contextual answers to their questions in real-time.",
    image: "/minimalist-black-and-white-chat-conversation-inter.jpg",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">How AskNest Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get up and running in minutes with our simple three-step process.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <Card className="overflow-hidden bg-black">
                  <CardContent className="p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-64 object-cover" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}