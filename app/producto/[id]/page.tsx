"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { products, type Product } from "@/data/products"
import { Minus, Plus, ShoppingCart, ArrowLeft, Truck, Clock, Shield } from "lucide-react"
import ProductGrid from "@/components/product/product-grid"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    setIsLoading(true)

    setTimeout(() => {
      const productId = Number(params.id)
      const foundProduct = products.find((p) => p.id === productId)

      if (foundProduct) {
        setProduct(foundProduct)

        // Encontrar productos relacionados (misma categoría)
        const related = products
          .filter((p) => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 3)
        setRelatedProducts(related)
      } else {
        // Producto no encontrado
        toast({
          title: "Producto no encontrado",
          description: "El producto que buscas no existe o ha sido eliminado.",
          variant: "destructive",
        })
        router.push("/catalogo")
      }

      setIsLoading(false)
    }, 800)
  }, [params.id, router, toast])

  const handleQuantityChange = (value: number) => {
    if (!product) return
    if (value < 1) return
    if (value > product.stock) return
    setQuantity(value)
  }

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return

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
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="container py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden border">
            <Image
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg py-1 px-3">
                  Agotado
                </Badge>
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div>
          <div className="flex gap-2 mb-2">
            <Badge className="capitalize">{product.category}</Badge>
            {product.isSubscription && <Badge variant="secondary">Suscripción</Badge>}
          </div>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-muted-foreground line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          {product.isSubscription && (
            <div className="bg-muted p-4 rounded-md mb-6">
              <h3 className="font-medium mb-1">Producto de suscripción</h3>
              <p className="text-sm text-muted-foreground">
                Recibirás este producto {product.subscriptionFrequency === "weekly" ? "semanalmente" : "mensualmente"}.
                Puedes cancelar en cualquier momento desde tu perfil.
              </p>
            </div>
          )}

          {product.stock > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span>Cantidad:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-14 flex items-center justify-center border-y text-lg">{quantity}</div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock} disponibles</span>
              </div>

              {product.stock <= 5 && (
                <p className="text-sm text-amber-600 mb-4">¡Solo quedan {product.stock} unidades!</p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Añadir al carrito
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Comprar ahora
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="mb-8">
              <Badge variant="destructive" className="mb-4">
                Agotado
              </Badge>
              <p className="text-sm text-muted-foreground mb-4">
                Este producto está temporalmente agotado. Puedes registrarte para recibir una notificación cuando esté
                disponible.
              </p>
              <Button variant="outline">Notificarme cuando esté disponible</Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Envío gratuito</p>
                <p className="text-xs text-muted-foreground">En pedidos superiores a $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Entrega en 24-48h</p>
                <p className="text-xs text-muted-foreground">Para pedidos realizados antes de las 14h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Garantía de frescura</p>
                <p className="text-xs text-muted-foreground">Productos frescos y de calidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de información adicional */}
      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="nutrition">Información nutricional</TabsTrigger>
          <TabsTrigger value="reviews">Opiniones</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Descripción detallada</h3>
            <p>
              {product.longDescription ||
                `${product.description} Nuestros productos son cultivados y procesados siguiendo estrictos estándares de calidad y bienestar animal. Garantizamos la frescura y el sabor auténtico en cada producto.`}
            </p>

            <h3 className="text-lg font-medium mt-6">Características</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>100% orgánico y natural</li>
              <li>Producido en nuestra granja sostenible</li>
              <li>Sin antibióticos ni hormonas</li>
              <li>Animales criados en libertad</li>
              <li>Procesado el mismo día para máxima frescura</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="nutrition" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información nutricional</h3>
            <p className="text-sm text-muted-foreground mb-4">Valores medios por 100g de producto:</p>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Valor energético</td>
                    <td className="p-3 text-right">143 kcal</td>
                  </tr>
                  <tr className="border-b bg-muted/50">
                    <td className="p-3 font-medium">Proteínas</td>
                    <td className="p-3 text-right">12.5g</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Grasas</td>
                    <td className="p-3 text-right">9.5g</td>
                  </tr>
                  <tr className="border-b bg-muted/50">
                    <td className="p-3 font-medium">Carbohidratos</td>
                    <td className="p-3 text-right">0.7g</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Sal</td>
                    <td className="p-3 text-right">0.12g</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              * Los valores pueden variar ligeramente según el lote de producción.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Aún no hay opiniones</h3>
            <p className="text-muted-foreground mb-4">Sé el primero en opinar sobre este producto</p>
            <Button>Escribir una opinión</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <div>
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
