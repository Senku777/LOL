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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let filteredSubscriptions = [...subscriptions]

    // Filtrar por usuario si se proporciona
    if (userId) {
      filteredSubscriptions = filteredSubscriptions.filter((s) => s.userId === userId)
    }

    return NextResponse.json({ subscriptions: filteredSubscriptions })
  } catch (error) {
    console.error("Error al obtener suscripciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, products, frequency } = body

    if (!userId || !plan || !products || !frequency) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Crear nueva suscripción
    const newSubscription = {
      id: `${subscriptions.length + 1}`,
      userId,
      plan,
      products,
      frequency,
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    }

    subscriptions.push(newSubscription)

    return NextResponse.json(
      {
        subscription: newSubscription,
        message: "Suscripción creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear suscripción:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
