"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/use-toast"

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "Huevos Orgánicos",
    description: "Docena de huevos frescos de gallinas criadas en libertad",
    price: 5.99,
    image: "/carton-organic-eggs.png",
    category: "huevos",
    stock: 25,
  },
  {
    id: 2,
    name: "Pollo Entero",
    description: "Pollo entero criado sin antibióticos, listo para cocinar",
    price: 12.99,
    image: "/roasted-whole-chicken.png",
    category: "carne",
    stock: 8,
  },
  {
    id: 3,
    name: "Pechugas de Pollo",
    description: "Pack de pechugas de pollo frescas y orgánicas",
    price: 9.99,
    image: "/grilled-chicken-platter.png",
    category: "carne",
    stock: 15,
  },
]

export default function Home() {
  const { addItem } = useCart()
  const { toast } = useToast()

  // Función para agregar al carrito
  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Producto agotado",
        description: "Lo sentimos, este producto está temporalmente agotado.",
        variant: "destructive",
      })
      return
    }

    // Si es un producto de suscripción, mostrar mensaje informativo
    if (product.isSubscription) {
      toast({
        title: "Producto de suscripción",
        description: "Este producto requiere una suscripción. Por favor, visita la página de suscripciones.",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: product.stock,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido a tu carrito.`,
    })
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[500px] w-full relative">
          <Image src="/aerial-chicken-farm.png" alt="Granja Brotato" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Bienvenido a Brotato</h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Productos avícolas frescos, orgánicos y sostenibles directamente de nuestra granja a tu mesa
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/catalogo">Ver Productos</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/20 hover:bg-background/30 text-white border-white"
              >
                <Link href="/suscripciones">Suscripciones</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Productos Destacados</h2>
            <Link href="/catalogo" className="text-primary flex items-center hover:underline">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <Link href={`/producto/${product.id}`} className="block relative h-48">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  <Badge className="absolute top-2 right-2">{product.category}</Badge>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/producto/${product.id}`}>
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    <Button size="sm" onClick={() => handleAddToCart(product)}>
                      Añadir al carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-12 px-4 bg-muted">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Suscríbete y recibe productos frescos cada semana</h2>
              <p className="text-muted-foreground mb-6">
                Nuestros planes de suscripción te permiten recibir productos frescos directamente en tu puerta. Elige
                entre entregas semanales o mensuales.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/suscripciones">Suscríbete ahora</Link>
              </Button>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/organic-delivery-boxes.png"
                alt="Suscripción Brotato"
                width={500}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-12 px-4 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/thriving-sustainable-farm.png"
                alt="Nuestra Granja"
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Nuestra Historia</h2>
              <p className="text-muted-foreground mb-4">
                En Brotato, nos dedicamos a la cría de aves de corral con métodos sostenibles y respetuosos con el medio
                ambiente. Nuestras gallinas viven en libertad, alimentadas con productos orgánicos.
              </p>
              <p className="text-muted-foreground mb-6">
                Fundada en 2010, nuestra granja ha crecido manteniendo siempre nuestros valores de sostenibilidad,
                bienestar animal y producción de alimentos saludables.
              </p>
              <Button asChild variant="outline">
                <Link href="/contacto">Contáctanos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-12 px-4 bg-muted">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Blog Educativo</h2>
            <Link href="/blog" className="text-primary flex items-center hover:underline">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden">
                <Link href={`/blog/${item}`} className="block relative h-48">
                  <Image
                    src={`/modern-poultry-farm.png?height=200&width=400&query=granja+avicola+${item}`}
                    alt={`Artículo ${item}`}
                    fill
                    className="object-cover"
                  />
                </Link>
                <CardContent className="p-4">
                  <Link href={`/blog/${item}`}>
                    <h3 className="text-lg font-semibold mb-2">Beneficios de los productos orgánicos</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4">
                    Descubre por qué los productos orgánicos son mejores para tu salud y el medio ambiente...
                  </p>
                  <Link href={`/blog/${item}`} className="text-primary hover:underline">
                    Leer más
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
