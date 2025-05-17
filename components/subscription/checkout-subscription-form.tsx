"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface CheckoutSubscriptionFormProps {
  plan: any // Replace 'any' with a more specific type if available
}

export function CheckoutSubscriptionForm({ plan }: CheckoutSubscriptionFormProps) {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  // Actualizar el método handleSubmit para crear una suscripción
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas iniciar sesión para suscribirte a un plan",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    // Basic validation
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    // Simulate successful subscription
    // En una implementación real, aquí se enviaría la información al backend
    // y se actualizaría el estado del usuario con la nueva suscripción

    // Simulamos un tiempo de procesamiento
    toast({
      title: "Procesando...",
      description: "Estamos procesando tu suscripción",
    })

    setTimeout(() => {
      toast({
        title: "Suscripción exitosa",
        description: `Te has suscrito al plan ${plan.name}. ¡Bienvenido!`,
      })

      // En una implementación real, el backend actualizaría el estado del usuario
      // y la información de la suscripción se obtendría al iniciar sesión nuevamente

      router.push("/perfil") // Redirect to profile or confirmation page
    }, 2000)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Detalles de Pago</h2>
        <p className="text-muted-foreground mb-6">Ingresa los detalles de tu tarjeta para completar la suscripción.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de tarjeta</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              type="text"
              placeholder="**** **** **** ****"
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Fecha de expiración</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="text"
                placeholder="MM/AA"
                value={cardDetails.expiryDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <Button className="w-full">Suscribirse a {plan.name}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
