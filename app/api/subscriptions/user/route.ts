import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de suscripciones
const subscriptions: any[] = [
  {
    id: "1",
    userId: "1",
    plan: "mensual",
    products: [
      { productId: "1", quantity: 4 },
      { productId: "2", quantity: 2 },
    ],
    frequency: "weekly",
    nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // En una aplicación real, aquí obtendríamos el ID del usuario del token JWT
    const userId = "1" // Simulamos que el usuario actual es el ID 1

    // Filtrar suscripciones del usuario
    const userSubscriptions = subscriptions.filter((s) => s.userId === userId)

    return NextResponse.json({ subscriptions: userSubscriptions })
  } catch (error) {
    console.error("Error al obtener suscripciones del usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
