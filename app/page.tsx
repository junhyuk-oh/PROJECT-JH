import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import AIExperience from "@/components/ai-experience"
import Process from "@/components/process"
import Differentiators from "@/components/differentiators"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
      <Header />
      <Hero />
      <Features />
      <AIExperience />
      <Process />
      <Differentiators />
      <Footer />
    </div>
  )
}
