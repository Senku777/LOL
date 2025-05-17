export type Product = {
  id: number
  name: string
  description: string
  longDescription?: string
  price: number
  oldPrice?: number
  image: string
  images?: string[]
  category: string
  stock: number
  isSubscription?: boolean
  subscriptionFrequency?: "weekly" | "monthly"
}

export const products: Product[] = [
  {
    id: 1,
    name: "Huevos Orgánicos",
    description: "Docena de huevos frescos de gallinas criadas en libertad",
    longDescription:
      "Nuestros huevos orgánicos provienen de gallinas criadas en libertad, alimentadas con pienso 100% orgánico y sin antibióticos. Cada huevo es recolectado diariamente para garantizar la máxima frescura y calidad. El color y tamaño pueden variar ligeramente, lo que es una señal de su origen natural.",
    price: 5.99,
    image: "/carton-organic-eggs.png",
    images: ["/carton-organic-eggs.png", "/cracked-organic-eggs.png", "/free-range-chickens.png"],
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
  {
    id: 4,
    name: "Huevos de Codorniz",
    description: "Pack de huevos de codorniz, pequeños y nutritivos",
    price: 7.99,
    image: "/speckled-quail-eggs.png",
    category: "huevos",
    stock: 12,
  },
  {
    id: 5,
    name: "Muslos de Pollo",
    description: "Pack de muslos de pollo orgánicos",
    price: 8.99,
    oldPrice: 10.99,
    image: "/grilled-chicken-thighs.png",
    category: "carne",
    stock: 0,
  },
  {
    id: 6,
    name: "Huevos Jumbo",
    description: "Media docena de huevos jumbo de gallinas felices",
    price: 6.99,
    image: "/carton-of-jumbo-eggs.png",
    category: "huevos",
    stock: 3,
  },
  {
    id: 7,
    name: "Suscripción Huevos Semanal",
    description: "Recibe una docena de huevos orgánicos cada semana",
    price: 19.99,
    image: "/placeholder.svg?height=400&width=600&query=suscripcion+huevos",
    category: "suscripcion",
    stock: 999,
    isSubscription: true,
    subscriptionFrequency: "weekly",
  },
  {
    id: 8,
    name: "Suscripción Pollo Mensual",
    description: "Recibe un pack variado de carne de pollo cada mes",
    price: 39.99,
    image: "/placeholder.svg?height=400&width=600&query=suscripcion+pollo",
    category: "suscripcion",
    stock: 999,
    isSubscription: true,
    subscriptionFrequency: "monthly",
  },
]
