import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// POST - Registrar un usuario en un tour
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validación básica
    if (!data.tourId || !data.userId || !data.participants) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const tourId = Number.parseInt(data.tourId)
    const userId = data.userId
    const participants = Number.parseInt(data.participants)

    if (isNaN(tourId) || isNaN(participants) || participants <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Verificar si el tour existe
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar si hay espacio disponible
    if (tour.currentParticipants + participants > tour.maxParticipants) {
      return NextResponse.json(
        {
          error: "No hay suficientes plazas disponibles para este tour",
          availableSpots: tour.maxParticipants - tour.currentParticipants,
        },
        { status: 400 },
      )
    }

    // Verificar si el usuario ya está registrado en este tour
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tourId,
        userId,
        status: {
          not: "CANCELLED",
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: "Ya tienes una reserva para este tour" }, { status: 400 })
    }

    // Calcular precio total
    const totalPrice = tour.price * participants

    // Crear nueva reserva
    const newBooking = await prisma.booking.create({
      data: {
        tourId,
        userId,
        status: "PENDING",
        participants,
        totalPrice,
      },
    })

    // Actualizar el contador de participantes
    await prisma.tour.update({
      where: { id: tourId },
      data: {
        currentParticipants: tour.currentParticipants + participants,
        status: tour.currentParticipants + participants >= tour.maxParticipants ? "SCHEDULED" : tour.status,
      },
    })

    return NextResponse.json(
      {
        booking: newBooking,
        message: "Reserva creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar en tour:", error)
    return NextResponse.json({ error: "Error al registrar en el tour" }, { status: 500 })
  }
}
