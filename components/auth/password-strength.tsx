"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    // Evaluar requisitos
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    setRequirements(newRequirements)

    // Calcular fortaleza (0-100)
    const metRequirements = Object.values(newRequirements).filter(Boolean).length
    setStrength((metRequirements / 5) * 100)
  }, [password])

  const getStrengthLabel = () => {
    if (strength === 0) return "Vacío"
    if (strength < 40) return "Débil"
    if (strength < 80) return "Moderada"
    return "Fuerte"
  }

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200"
    if (strength < 40) return "bg-red-500"
    if (strength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">Fortaleza: {getStrengthLabel()}</span>
        <span className="text-xs">{Math.round(strength)}%</span>
      </div>
      <Progress value={strength} className={`h-2 ${getStrengthColor()}`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
        <RequirementItem met={requirements.length} text="Mínimo 8 caracteres" />
        <RequirementItem met={requirements.uppercase} text="Al menos una mayúscula" />
        <RequirementItem met={requirements.lowercase} text="Al menos una minúscula" />
        <RequirementItem met={requirements.number} text="Al menos un número" />
        <RequirementItem met={requirements.special} text="Al menos un carácter especial" />
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={met ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>{text}</span>
    </div>
  )
}
