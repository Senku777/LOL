import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Obtener todas las reservas de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    if (!userId) {
      return NextResponse.json({ error: "Se requiere el ID del usuario" }, { status: 400 })
    }

    // Construir el objeto de filtro para Prisma
    const where: any = {
      userId,
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    // Obtener reservas del usuario con detalles del tour
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tour: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      bookings,
      total: bookings.length,
      filters: {
        userId,
        status,
      },
    })
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    return NextResponse.json({ error: "Error al obtener las reservas del usuario" }, { status: 500 })
  }
}

// PUT - Actualizar el estado de una reserva
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Validación básica
    if (!data.bookingId || !data.status) {
      return NextResponse.json({ error: "Se requieren el ID de la reserva y el estado" }, { status: 400 })
    }

    const bookingId = data.bookingId
    const status = data.status.toUpperCase()

    // Verificar si la reserva existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Verificar que el estado sea válido
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado de reserva no válido" }, { status: 400 })
    }

    // Actualizar el estado de la reserva
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    // Si se cancela la reserva, actualizar el contador de participantes del tour
    if (status === "CANCELLED" && booking.status !== "CANCELLED") {
      await prisma.tour.update({
        where: { id: booking.tourId },
        data: {
          currentParticipants: {
            decrement: booking.participants,
          },
        },
      })
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: "Reserva actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar reserva:", error)
    return NextResponse.json({ error: "Error al actualizar la reserva" }, { status: 500 })
  }
}
