"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

const subscriptionPlans = [
  {
    id: "semanal",
    name: "Plan Semanal",
    price: 24.99,
    description: "Recibe productos frescos cada semana",
    features: [
      "Huevos orgánicos (1 docena)",
      "Pollo entero (1 unidad)",
      "Entrega a domicilio",
      "Cambios hasta 24h antes",
      "Acceso a recetas exclusivas",
    ],
  },
  {
    id: "mensual",
    name: "Plan Mensual",
    price: 89.99,
    description: "Recibe productos frescos cada mes",
    features: [
      "Huevos orgánicos (4 docenas)",
      "Pollo entero (2 unidades)",
      "Pechugas de pollo (2 packs)",
      "Entrega a domicilio gratuita",
      "Cambios hasta 48h antes",
      "Acceso a recetas exclusivas",
      "10% de descuento en productos adicionales",
    ],
    popular: true,
  },
]

export default function SuscripcionesPage() {
  const { isAuthenticated, hasActiveSubscription, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      // Si no está autenticado, redirigir al login
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas iniciar sesión para suscribirte a un plan",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/checkout-suscripcion?plan=${planId}`)
      return
    }

    // Verificar si el usuario ya tiene una suscripción activa
    if (hasActiveSubscription) {
      toast({
        title: "Ya tienes una suscripción activa",
        description: "Debes cancelar tu suscripción actual antes de suscribirte a un nuevo plan.",
        variant: "destructive",
      })
      return
    }

    // Si está autenticado y no tiene suscripción activa, redirigir al checkout de suscripción
    router.push(`/checkout-suscripcion?plan=${planId}`)
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Planes de Suscripción</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suscríbete a nuestros planes y recibe productos frescos directamente en tu puerta. Elige el plan que mejor se
          adapte a tus necesidades.
        </p>
      </div>

      {isAuthenticated && hasActiveSubscription && (
        <Alert className="mb-8 max-w-4xl mx-auto">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Ya tienes una suscripción activa</AlertTitle>
          <AlertDescription>
            Actualmente estás suscrito al plan {user?.subscription?.planName}. Tu próximo pago está programado para el{" "}
            {new Date(user?.subscription?.nextBillingDate || "").toLocaleDateString()}. Puedes gestionar tu suscripción
            desde tu{" "}
            <Link href="/perfil" className="font-medium underline underline-offset-4">
              perfil
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={plan.popular ? "border-primary shadow-lg" : ""}>
            {plan.popular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                  Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isAuthenticated && hasActiveSubscription ? (
                <Button className="w-full" variant="outline" disabled>
                  Ya tienes una suscripción activa
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleSubscribe(plan.id)}>
                  Suscribirse
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">¿Preguntas sobre nuestros planes?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Estamos aquí para ayudarte. Contáctanos para resolver cualquier duda sobre nuestros planes de suscripción.
        </p>
        <Button asChild variant="outline">
          <Link href="/contacto">Contactar</Link>
        </Button>
      </div>
    </div>
  )
}
