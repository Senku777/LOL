import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de suscripciones
let subscriptions: any[] = [
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar suscripción por ID
    const subscription = subscriptions.find((s) => s.id === id)

    if (!subscription) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error al obtener suscripción:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Buscar suscripción por ID
    const subscriptionIndex = subscriptions.findIndex((s) => s.id === id)

    if (subscriptionIndex === -1) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 })
    }

    // Actualizar suscripción
    subscriptions[subscriptionIndex] = {
      ...subscriptions[subscriptionIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      subscription: subscriptions[subscriptionIndex],
      message: "Suscripción actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar suscripción:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar suscripción por ID
    const subscriptionIndex = subscriptions.findIndex((s) => s.id === id)

    if (subscriptionIndex === -1) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 })
    }

    // Eliminar suscripción
    const deletedSubscription = subscriptions[subscriptionIndex]
    subscriptions = subscriptions.filter((s) => s.id !== id)

    return NextResponse.json({
      message: "Suscripción eliminada exitosamente",
      subscription: deletedSubscription,
    })
  } catch (error) {
    console.error("Error al eliminar suscripción:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
