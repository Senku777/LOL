"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, subtotal, shippingCost, total, validateStock } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [itemToRemove, setItemToRemove] = useState<number | null>(null)
  const [stockWarnings, setStockWarnings] = useState<number[]>([])

  // Verificar stock al cargar la página
  useEffect(() => {
    const stockValidation = validateStock()
    if (!stockValidation.valid) {
      const invalidItemIds = stockValidation.invalidItems.map((item) => item.id)
      setStockWarnings(invalidItemIds)

      toast({
        title: "Stock actualizado",
        description: "Algunos productos en tu carrito han sido actualizados debido a cambios en el inventario.",
        variant: "warning",
      })
    }
  }, [validateStock, toast])

  const handleRemoveItem = (id: number) => {
    // Si el producto es caro (>$50), pedir confirmación
    const item = items.find((item) => item.id === id)
    if (item && item.price * item.quantity > 50) {
      setItemToRemove(id)
    } else {
      removeItem(id)
    }
  }

  const confirmRemove = () => {
    if (itemToRemove !== null) {
      removeItem(itemToRemove)
      setItemToRemove(null)
    }
  }

  const cancelRemove = () => {
    setItemToRemove(null)
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas iniciar sesión para completar tu compra.",
        variant: "destructive",
      })
    }

    // Verificar stock antes de proceder
    const stockValidation = validateStock()
    if (!stockValidation.valid) {
      toast({
        title: "Stock insuficiente",
        description: "Algunos productos no tienen suficiente stock. Por favor, actualiza tu carrito.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compra</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">Parece que aún no has añadido ningún producto a tu carrito.</p>
          <Button asChild>
            <Link href="/catalogo">Explorar Productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {stockWarnings.length > 0 && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Algunos productos han sido ajustados debido a cambios en el inventario disponible.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className={stockWarnings.includes(item.id) ? "border-amber-500" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/producto/${item.id}`} className="hover:underline">
                          <h3 className="font-semibold">{item.name}</h3>
                        </Link>
                        <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                        {item.isSubscription && (
                          <Badge variant="outline" className="mt-1">
                            Suscripción {item.subscriptionFrequency === "weekly" ? "semanal" : "mensual"}
                          </Badge>
                        )}
                        {stockWarnings.includes(item.id) && (
                          <p className="text-xs text-amber-600 mt-1">Stock actualizado</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      <span>${shippingCost.toFixed(2)}</span>
                    )}
                  </div>
                  {shippingCost > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Añade ${(50 - subtotal).toFixed(2)} más para obtener envío gratis
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                <Button
                  asChild
                  className="w-full"
                  onClick={!isAuthenticated || stockWarnings.length > 0 ? handleProceedToCheckout : undefined}
                  disabled={stockWarnings.length > 0}
                >
                  <Link href={isAuthenticated ? "/checkout" : "/auth/login?redirect=/checkout"}>
                    Proceder al Pago
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/catalogo">Continuar Comprando</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      <AlertDialog open={itemToRemove !== null} onOpenChange={cancelRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
