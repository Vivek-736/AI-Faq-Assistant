import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                AI-Powered FAQ Assistant That Actually <span className="italic">Understands</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                Transform your customer support with intelligent FAQ assistance. AskNest learns from your content and
                provides instant, accurate answers that feel human.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={'/dashboard'}>
                <Button size="lg" className="text-lg px-8 py-6 cursor-pointer">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={'/dashboard'}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent cursor-pointer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  See Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/minimalist-black-and-white-ai-chatbot-interface-wi.jpg"
                alt="AskNest AI Assistant Interface"
                className="w-full h-full object-cover border-2 border-black rounded-4xl"
              />
            </div>
            <div className="absolute -top-4 -right-4 bg-background border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}