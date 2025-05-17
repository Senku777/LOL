import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for products
const products = [
  {
    id: 1,
    name: "Huevos Orgánicos",
    description: "Docena de huevos frescos de gallinas criadas en libertad",
    price: 5.99,
    image: "/carton-organic-eggs.png",
    category: "huevos",
  },
  {
    id: 2,
    name: "Pollo Entero",
    description: "Pollo entero criado sin antibióticos, listo para cocinar",
    price: 12.99,
    image: "/roasted-whole-chicken.png",
    category: "carne",
  },
  {
    id: 3,
    name: "Pechugas de Pollo",
    description: "Pack de pechugas de pollo frescas y orgánicas",
    price: 9.99,
    image: "/grilled-chicken-platter.png",
    category: "carne",
  },
  {
    id: 4,
    name: "Huevos de Codorniz",
    description: "Pack de huevos de codorniz, pequeños y nutritivos",
    price: 7.99,
    image: "/placeholder.svg?height=200&width=300&query=huevos+codorniz",
    category: "huevos",
  },
  {
    id: 5,
    name: "Muslos de Pollo",
    description: "Pack de muslos de pollo orgánicos",
    price: 8.99,
    image: "/placeholder.svg?height=200&width=300&query=muslos+pollo",
    category: "carne",
  },
  {
    id: 6,
    name: "Huevos Jumbo",
    description: "Media docena de huevos jumbo de gallinas felices",
    price: 6.99,
    image: "/placeholder.svg?height=200&width=300&query=huevos+jumbo",
    category: "huevos",
  },
]

export default function ProductList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            <Badge className="absolute top-2 right-2">{product.category}</Badge>
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <Button size="sm">Añadir al carrito</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
