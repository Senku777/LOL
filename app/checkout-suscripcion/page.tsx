"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckoutSubscriptionForm } from "@/components/subscription/checkout-subscription-form"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Definición de los planes disponibles
const SUBSCRIPTION_PLANS = {
  mensual: {
    id: "plan-mensual",
    name: "Plan Mensual",
    price: 29.99,
    description: "Entrega mensual de productos frescos de la granja",
    billingFrequency: "monthly",
    features: ["4 docenas de huevos orgánicos", "2kg de pollo orgánico", "Productos de temporada", "Entrega gratuita"],
  },
  semanal: {
    id: "plan-semanal",
    name: "Plan Semanal",
    price: 19.99,
    description: "Entrega semanal de productos frescos de la granja",
    billingFrequency: "weekly",
    features: ["1 docena de huevos orgánicos", "500g de pollo orgánico", "Productos de temporada", "Entrega gratuita"],
  },
  premium: {
    id: "plan-premium",
    name: "Plan Premium",
    price: 49.99,
    description: "Entrega mensual premium con productos exclusivos",
    billingFrequency: "monthly",
    features: [
      "6 docenas de huevos orgánicos",
      "4kg de pollo orgánico",
      "Productos gourmet exclusivos",
      "Entrega prioritaria",
      "Acceso a eventos exclusivos",
    ],
  },
}

export default function CheckoutSubscriptionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isLoading && !user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para acceder a esta página",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/checkout-suscripcion?plan=${searchParams.get("plan") || "mensual"}`)
      return
    }

    // Verificar si el usuario ya tiene una suscripción activa
    if (!isLoading && user?.subscription?.status === "active") {
      toast({
        title: "Ya tienes una suscripción activa",
        description: "Debes cancelar tu suscripción actual antes de suscribirte a un nuevo plan.",
        variant: "destructive",
      })
      router.push("/suscripciones")
      return
    }

    // Obtener el plan de la URL
    const planType = searchParams.get("plan") || "mensual"

    // Verificar si el plan existe
    if (SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      setSelectedPlan(SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS])
    } else {
      // Si el plan no existe, usar el plan mensual por defecto
      setSelectedPlan(SUBSCRIPTION_PLANS.mensual)
      toast({
        title: "Plan no encontrado",
        description: "El plan seleccionado no existe. Se ha seleccionado el plan mensual por defecto.",
        variant: "destructive",
      })
    }

    setIsPageLoading(false)
  }, [searchParams, router, toast, user, isLoading])

  if (isPageLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Plan no encontrado</h1>
          <p className="text-muted-foreground mb-6">Lo sentimos, el plan que buscas no está disponible.</p>
          <button
            onClick={() => router.push("/suscripciones")}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Ver planes disponibles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout de Suscripción</h1>
        <CheckoutSubscriptionForm plan={selectedPlan} />
      </div>
    </div>
  )
}
