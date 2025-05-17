"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useCheckout } from "@/contexts/checkout-context"
import { useAuth } from "@/contexts/auth-context"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, itemCount, validateStock } = useCart()
  const { currentStep } = useCheckout()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout")
    }
  }, [isAuthenticated, router])

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (itemCount === 0 && currentStep !== "confirmation") {
      router.push("/carrito")
    }
  }, [itemCount, currentStep, router])

  // Verificar stock al cargar la página
  useEffect(() => {
    if (items.length > 0) {
      const stockValidation = validateStock()
      if (!stockValidation.valid) {
        // Si hay productos sin stock suficiente, mostrar alerta pero no redirigir
        console.log("Productos sin stock suficiente:", stockValidation.invalidItems)
      }
    }
  }, [items, validateStock])

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Debes iniciar sesión para acceder al proceso de compra.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/auth/login?redirect=/checkout">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  if (itemCount === 0 && currentStep !== "confirmation") {
    return (
      <div className="container py-12">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tu carrito está vacío. Añade productos antes de continuar con la compra.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/catalogo">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <CheckoutSteps />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {currentStep === "shipping" && <ShippingForm />}
              {currentStep === "payment" && <PaymentForm />}
              {currentStep === "confirmation" && <OrderConfirmation />}
            </CardContent>
          </Card>
        </div>

        <div>
          <CheckoutSummary />
        </div>
      </div>
    </div>
  )
}
