import { type NextRequest, NextResponse } from "next/server"
import { BackendService } from "@/lib/BackendService"
import { format, addDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const date = searchParams.get("date")

    let tours = await BackendService.getAllTours()

    // Filtrar por categoría si se proporciona
    if (category && category !== "all") {
      tours = tours.filter((tour) => tour.category === category)
    }

    // Filtrar por fecha si se proporciona
    if (date && date !== "all") {
      tours = tours.filter((tour) => tour.date === date)
    }

    // Filtrar solo tours programados
    tours = tours.filter((tour) => tour.status === "SCHEDULED")

    return NextResponse.json({ tours })
  } catch (error) {
    console.error("Error al obtener tours disponibles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tourId, userId, participantName, participantEmail } = body

    if (!tourId || !participantName || !participantEmail) {
      return NextResponse.json({ error: "Todos los campos requeridos son necesarios" }, { status: 400 })
    }

    // Verificar si el tour existe y tiene espacio disponible
    const tour = await BackendService.getTourById(Number(tourId))
    
    if (!tour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 })
    }
    
    if (tour.currentParticipants >= tour.maxParticipants) {
      return NextResponse.json({ error: "El tour está completo" }, { status: 400 })
    }

    // Crear reserva
    const reservation = await BackendService.createTourReservation({
      tourId: Number(tourId),
      userId: userId || "guest",
      participantName,
      participantEmail
    })

    return NextResponse.json(
      {
        reservation,
        message: "Reserva creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear reserva de tour:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}