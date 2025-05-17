"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

export type ShippingAddress = {
  fullName: string
  address: string
  city: string
  postalCode: string
  phone: string
  notes?: string
}

export type PaymentMethod = "credit-card" | "cash-on-delivery"

export type PaymentDetails = {
  method: PaymentMethod
  cardNumber?: string
  cardName?: string
  expiryDate?: string
  cvv?: string
}

export type CheckoutStep = "shipping" | "payment" | "confirmation"

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "failed"

export type Order = {
  id: string
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>
  shippingAddress: ShippingAddress
  paymentDetails: Omit<PaymentDetails, "cvv">
  subtotal: number
  shippingCost: number
  total: number
  status: OrderStatus
  createdAt: string
}

type CheckoutContextType = {
  currentStep: CheckoutStep
  shippingAddress: ShippingAddress | null
  paymentDetails: PaymentDetails | null
  orderId: string | null
  setStep: (step: CheckoutStep) => void
  setShippingAddress: (address: ShippingAddress) => void
  setPaymentDetails: (details: PaymentDetails) => void
  processOrder: () => Promise<boolean>
  resetCheckout: () => void
  isProcessing: boolean
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  processingError: string | null
  validateCheckout: () => boolean
}

const CheckoutContext = createContext<CheckoutContextType>({
  currentStep: "shipping",
  shippingAddress: null,
  paymentDetails: null,
  orderId: null,
  setStep: () => {},
  setShippingAddress: () => {},
  setPaymentDetails: () => {},
  processOrder: async () => false,
  resetCheckout: () => {},
  isProcessing: false,
  termsAccepted: false,
  setTermsAccepted: () => {},
  processingError: null,
  validateCheckout: () => false,
})

export const useCheckout = () => useContext(CheckoutContext)

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)

  const { clearCart, items, subtotal, shippingCost, total, validateStock } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const setStep = (step: CheckoutStep) => {
    setCurrentStep(step)
  }

  const resetCheckout = () => {
    setCurrentStep("shipping")
    setShippingAddress(null)
    setPaymentDetails(null)
    setOrderId(null)
    setTermsAccepted(false)
    setProcessingError(null)
  }

  // Validar que todos los datos necesarios estén presentes
  const validateCheckout = () => {
    if (!shippingAddress) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa los datos de envío.",
        variant: "destructive",
      })
      return false
    }

    if (!paymentDetails) {
      toast({
        title: "Datos incompletos",
        description: "Por favor selecciona un método de pago.",
        variant: "destructive",
      })
      return false
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en tu carrito.",
        variant: "destructive",
      })
      return false
    }

    if (!termsAccepted) {
      toast({
        title: "Términos y condiciones",
        description: "Debes aceptar los términos y condiciones para continuar.",
        variant: "destructive",
      })
      return false
    }

    // Validar stock disponible
    const stockValidation = validateStock()
    if (!stockValidation.valid) {
      const itemNames = stockValidation.invalidItems.map((item) => item.name).join(", ")
      toast({
        title: "Stock insuficiente",
        description: `Los siguientes productos no tienen suficiente stock: ${itemNames}`,
        variant: "destructive",
      })
      return false
    }

    // Validar límite de efectivo contra entrega
    if (paymentDetails.method === "cash-on-delivery" && total > 100) {
      toast({
        title: "Límite excedido",
        description: "El pago contra entrega solo está disponible para pedidos menores a $100.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const processOrder = async (): Promise<boolean> => {
    // Validar checkout
    if (!validateCheckout()) {
      return false
    }

    setIsProcessing(true)
    setProcessingError(null)

    try {
      // Simulación de procesamiento de pedido
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verificar stock (simulado)
      const stockValidation = validateStock()
      if (!stockValidation.valid) {
        const itemNames = stockValidation.invalidItems.map((item) => item.name).join(", ")
        toast({
          title: "Producto agotado",
          description: `Lo sentimos, los siguientes productos ya no están disponibles en la cantidad solicitada: ${itemNames}`,
          variant: "destructive",
        })
        setIsProcessing(false)
        return false
      }

      // Simulación de error de pago (10% de probabilidad)
      if (Math.random() < 0.1) {
        setProcessingError("Error en el procesamiento del pago. Por favor, intenta con otro método.")
        toast({
          title: "Error en el pago",
          description: "No se pudo procesar el pago. Por favor, intenta con otro método.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return false
      }

      // Generar ID de pedido
      const newOrderId = `BRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      setOrderId(newOrderId)

      // Simular registro del pedido en la base de datos
      const newOrder: Order = {
        id: newOrderId,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress!,
        paymentDetails: {
          method: paymentDetails!.method,
          cardNumber: paymentDetails?.cardNumber ? `xxxx-xxxx-xxxx-${paymentDetails.cardNumber.slice(-4)}` : undefined,
          cardName: paymentDetails?.cardName,
          expiryDate: paymentDetails?.expiryDate,
        },
        subtotal,
        shippingCost,
        total,
        status: "processing",
        createdAt: new Date().toISOString(),
      }

      // Guardar el pedido en localStorage para simular persistencia
      const savedOrders = localStorage.getItem("brotato-orders")
      const orders = savedOrders ? JSON.parse(savedOrders) : []
      localStorage.setItem("brotato-orders", JSON.stringify([...orders, newOrder]))

      // Notificación para pedidos grandes (>$500)
      if (total > 500) {
        console.log("Notificación a administradores: Pedido grande recibido", newOrderId)
      }

      // Limpiar carrito
      clearCart()

      // Redirigir a confirmación
      setCurrentStep("confirmation")
      setIsProcessing(false)
      return true
    } catch (error) {
      console.error("Error processing order:", error)
      setProcessingError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.")
      toast({
        title: "Error en el pedido",
        description: "Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsProcessing(false)
      return false
    }
  }

  return (
    <CheckoutContext.Provider
      value={{
        currentStep,
        shippingAddress,
        paymentDetails,
        orderId,
        setStep,
        setShippingAddress,
        setPaymentDetails,
        processOrder,
        resetCheckout,
        isProcessing,
        termsAccepted,
        setTermsAccepted,
        processingError,
        validateCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
