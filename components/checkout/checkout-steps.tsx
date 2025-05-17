"use client"

import { useCheckout } from "@/contexts/checkout-context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const steps = [
  { id: "shipping", label: "Envío" },
  { id: "payment", label: "Pago" },
  { id: "confirmation", label: "Confirmación" },
]

export function CheckoutSteps() {
  const { currentStep } = useCheckout()

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  isCompleted
                    ? "bg-green-600 text-white"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm",
                  isCompleted
                    ? "text-green-600 font-medium"
                    : isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-0 left-0 h-1 w-full bg-muted" />
        <div
          className="absolute top-0 left-0 h-1 bg-primary transition-all"
          style={{
            width: `${((currentStepIndex + (currentStep === "confirmation" ? 1 : 0.5)) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
