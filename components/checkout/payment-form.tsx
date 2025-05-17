"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCheckout } from "@/contexts/checkout-context"
import { CreditCard, Banknote, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"

export function PaymentForm() {
  const { setPaymentDetails, setStep } = useCheckout()
  const { total } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "cash-on-delivery">("credit-card")
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCashLimitWarning, setShowCashLimitWarning] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as "credit-card" | "cash-on-delivery")

    // Mostrar advertencia si el total es mayor a $100 y se selecciona pago contra entrega
    if (value === "cash-on-delivery" && total > 100) {
      setShowCashLimitWarning(true)
    } else {
      setShowCashLimitWarning(false)
    }

    // Limpiar errores al cambiar de método de pago
    setErrors({})
  }

  const validateForm = () => {
    if (paymentMethod === "cash-on-delivery") {
      // Validar límite de efectivo contra entrega
      if (total > 100) {
        setErrors({
          method: "El pago contra entrega solo está disponible para pedidos menores a $100",
        })
        return false
      }
      return true
    }

    const newErrors: Record<string, string> = {}

    if (!cardData.cardNumber.trim()) {
      newErrors.cardNumber = "El número de tarjeta es obligatorio"
    } else if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "El número de tarjeta debe tener 16 dígitos"
    } else if (!validateLuhn(cardData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Número de tarjeta inválido"
    }

    if (!cardData.cardName.trim()) {
      newErrors.cardName = "El nombre en la tarjeta es obligatorio"
    }

    if (!cardData.expiryDate.trim()) {
      newErrors.expiryDate = "La fecha de expiración es obligatoria"
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = "Formato inválido (MM/AA)"
    } else {
      // Validar que la fecha no esté expirada
      const [month, year] = cardData.expiryDate.split("/")
      const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 1)
      const currentDate = new Date()

      if (expiryDate < currentDate) {
        newErrors.expiryDate = "La tarjeta ha expirado"
      }
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = "El CVV es obligatorio"
    } else if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = "El CVV debe tener 3 o 4 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Algoritmo de Luhn para validar números de tarjeta
  const validateLuhn = (cardNumber: string): boolean => {
    let sum = 0
    let shouldDouble = false

    // Recorrer de derecha a izquierda
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cardNumber.charAt(i))

      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
  }

  const handleBack = () => {
    setStep("shipping")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setPaymentDetails({
      method: paymentMethod,
      ...(paymentMethod === "credit-card" ? cardData : {}),
    })

    // No avanzamos al siguiente paso aquí, ya que eso se maneja en el botón de "Confirmar Pedido"
    // en el componente CheckoutSummary
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
        <p className="text-muted-foreground mb-6">Selecciona tu método de pago preferido</p>
      </div>

      <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="space-y-4">
        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
          <RadioGroupItem value="credit-card" id="credit-card" />
          <Label htmlFor="credit-card" className="flex items-center cursor-pointer flex-1">
            <CreditCard className="mr-2 h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Tarjeta de Crédito/Débito</span>
              <p className="text-xs text-muted-foreground">Pago seguro con tarjeta</p>
            </div>
          </Label>
          <div className="flex gap-1">
            <div className="h-6 w-10 bg-muted rounded"></div>
            <div className="h-6 w-10 bg-muted rounded"></div>
            <div className="h-6 w-10 bg-muted rounded"></div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
          <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
          <Label htmlFor="cash-on-delivery" className="flex items-center cursor-pointer flex-1">
            <Banknote className="mr-2 h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Pago contra entrega</span>
              <p className="text-xs text-muted-foreground">Paga en efectivo al recibir tu pedido</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {showCashLimitWarning && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            El pago contra entrega solo está disponible para pedidos menores a $100. Tu pedido actual es de $
            {total.toFixed(2)}.
          </AlertDescription>
        </Alert>
      )}

      {errors.method && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.method}</AlertDescription>
        </Alert>
      )}

      {paymentMethod === "credit-card" && (
        <div className="space-y-4 mt-6 border-t pt-6">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">
              Número de tarjeta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleInputChange}
              className={errors.cardNumber ? "border-red-500" : ""}
              maxLength={19}
            />
            {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">
              Nombre en la tarjeta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cardName"
              name="cardName"
              placeholder="NOMBRE APELLIDO"
              value={cardData.cardName}
              onChange={handleInputChange}
              className={errors.cardName ? "border-red-500" : ""}
            />
            {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                Fecha de expiración <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/AA"
                value={cardData.expiryDate}
                onChange={handleInputChange}
                className={errors.expiryDate ? "border-red-500" : ""}
                maxLength={5}
              />
              {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">
                CVV <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={handleInputChange}
                className={errors.cvv ? "border-red-500" : ""}
                maxLength={4}
                type="password"
              />
              {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Volver
        </Button>
        <Button type="submit">Revisar Pedido</Button>
      </div>
    </form>
  )
}
