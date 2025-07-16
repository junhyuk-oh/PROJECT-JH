"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import UserExpertiseForm, { UserExpertise } from "./UserExpertiseForm"
import EnvironmentalFactorsForm, { EnvironmentalFactors } from "./EnvironmentalFactorsForm"
import { ChevronRight } from "lucide-react"
import { useResponsive } from "@/hooks/use-responsive"
import { cn } from "@/lib/utils"

interface EnvironmentalIntegratedFormProps {
  onComplete: (expertise: UserExpertise, factors: EnvironmentalFactors) => void
  onBack: () => void
}

export default function EnvironmentalIntegratedForm({ 
  onComplete, 
  onBack 
}: EnvironmentalIntegratedFormProps) {
  const { isMobile } = useResponsive()
  const [expertise, setExpertise] = useState<UserExpertise | null>(null)
  const [factors, setFactors] = useState<EnvironmentalFactors | null>(null)

  const handleSubmit = () => {
    if (expertise && factors) {
      onComplete(expertise, factors)
    }
  }

  const isComplete = expertise && factors

  return (
    <div className="space-y-6">
      <div className={cn(
        "gap-6",
        isMobile ? "grid grid-cols-1" : "grid md:grid-cols-2"
      )}>
        <UserExpertiseForm 
          onComplete={(e) => setExpertise(e)}
          onBack={onBack}
        />
        <EnvironmentalFactorsForm
          onComplete={(f) => setFactors(f)}
          onBack={onBack}
        />
      </div>
      
      {isComplete && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4"
          >
            다음 단계로
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}