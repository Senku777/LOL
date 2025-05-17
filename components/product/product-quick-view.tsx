"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/data/products"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ProductQuickViewProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  if (!product) return null

  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    if (value > product.stock) return
    setQuantity(value)
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast({
        title: "Producto agotado",
        description: "Lo sentimos, este producto está temporalmente agotado.",
        variant: "destructive",
      })
      return
    }

    // Si es un producto de suscripción, redirigir a la página de suscripción
    if (product.isSubscription) {
      onClose()
      router.push(`/suscripciones?plan=${product.subscriptionFrequency === "weekly" ? "semanal" : "mensual"}`)
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      stock: product.stock,
      isSubscription: product.isSubscription,
      subscriptionFrequency: product.subscriptionFrequency,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido a tu carrito.`,
    })

    onClose()
    setQuantity(1)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Vista rápida del producto</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="relative h-64 md:h-full rounded-md overflow-hidden">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="flex gap-2 mb-2">
              <Badge className="capitalize">{product.category}</Badge>
              {product.isSubscription && <Badge variant="secondary">Suscripción</Badge>}
            </div>

            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-muted-foreground mb-4">{product.description}</p>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">${product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            {product.stock > 0 ? (
              <>
                <div className="flex items-center gap-4 my-4">
                  <span className="text-sm">Cantidad:</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="h-8 w-12 flex items-center justify-center border-y">{quantity}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {product.stock <= 5 && (
                  <p className="text-sm text-amber-600 mb-4">¡Solo quedan {product.stock} unidades!</p>
                )}
              </>
            ) : (
              <Badge variant="destructive" className="my-4 w-fit">
                Agotado
              </Badge>
            )}

            {product.isSubscription && (
              <div className="bg-muted p-3 rounded-md mb-4">
                <p className="text-sm font-medium">Producto de suscripción</p>
                <p className="text-xs text-muted-foreground">
                  Recibirás este producto {product.subscriptionFrequency === "weekly" ? "semanalmente" : "mensualmente"}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:order-first">
            Cancelar
          </Button>
          <Link href={`/producto/${product.id}`} passHref>
            <Button variant="secondary" className="w-full sm:w-auto">
              Ver detalles
            </Button>
          </Link>
          {product.isSubscription ? (
            <Button
              onClick={() => {
                onClose()
                router.push(`/suscripciones?plan=${product.subscriptionFrequency === "weekly" ? "semanal" : "mensual"}`)
              }}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Suscribirse
            </Button>
          ) : (
            <Button onClick={handleAddToCart} disabled={product.stock <= 0} className="w-full sm:w-auto">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Añadir al carrito
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
