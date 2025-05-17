"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "@/contexts/cart-context"
import { useCheckout } from "@/contexts/checkout-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CheckoutSummary() {
  const { items, subtotal, shippingCost, total } = useCart()
  const { currentStep, processOrder, isProcessing, termsAccepted, setTermsAccepted, processingError } = useCheckout()
  const [showAllItems, setShowAllItems] = useState(false)

  const displayItems = showAllItems ? items : items.slice(0, 3)
  const hasMoreItems = items.length > 3 && !showAllItems

  const handleProcessOrder = async () => {
    await processOrder()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>

        {/* Lista de productos */}
        <div className="space-y-4 mb-6">
          {displayItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} x ${item.price.toFixed(2)}
                </p>
              </div>
              <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          {hasMoreItems && (
            <Button variant="link" className="text-sm p-0 h-auto" onClick={() => setShowAllItems(true)}>
              Ver {items.length - 3} productos más
            </Button>
          )}
        </div>

        <Separator className="my-4" />

        {/* Costos */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            {shippingCost === 0 ? (
              <span className="text-green-600">Gratis</span>
            ) : (
              <span>${shippingCost.toFixed(2)}</span>
            )}
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Términos y condiciones */}
        {currentStep === "payment" && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm">
                Acepto los{" "}
                <a href="/terminos" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="/privacidad" className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  política de privacidad
                </a>
              </Label>
            </div>

            {processingError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      {currentStep === "payment" && (
        <CardFooter className="px-6 py-4 pt-0">
          <Button className="w-full" onClick={handleProcessOrder} disabled={isProcessing || !termsAccepted}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Pedido"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
