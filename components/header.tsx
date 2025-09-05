"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-x-2.5">
            <Image width={50} height={50} alt="image" src={'/favicon.png'} className="border-2 border-black rounded-full" />
            <h1 className="text-2xl font-bold text-foreground">AskNest</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <Button variant="outline" className="mr-2 cursor-pointer bg-transparent">
              Sign In
            </Button>
            <Button className="cursor-pointer">Get Started</Button>
          </nav>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline">Sign In</Button>
                <Button>Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}