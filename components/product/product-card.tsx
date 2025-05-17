"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/data/products"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: Product
  onQuickView: () => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
      // Esta lógica se maneja en el componente ProductQuickView o en la página de detalle
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: product.stock,
      isSubscription: product.isSubscription,
      subscriptionFrequency: product.subscriptionFrequency,
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView()
  }

  return (
    <Link href={`/producto/${product.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-48">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <Badge className="capitalize">{product.category}</Badge>
            {product.isSubscription && <Badge variant="secondary">Suscripción</Badge>}
          </div>
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1 px-3">
                Agotado
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-8 w-8 opacity-80 hover:opacity-100"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.isSubscription ? (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = `/suscripciones?plan=${product.subscriptionFrequency === "weekly" ? "semanal" : "mensual"}`
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Suscribirse
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={cn(product.stock <= 0 && "opacity-50 cursor-not-allowed")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-amber-600 mt-2">¡Solo quedan {product.stock} unidades!</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
