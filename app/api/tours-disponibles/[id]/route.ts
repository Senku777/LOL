import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Obtener un tour específico por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de tour inválido" }, { status: 400 })
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error al obtener tour:", error)
    return NextResponse.json({ error: "Error al obtener el tour" }, { status: 500 })
  }
}

// PUT - Actualizar un tour específico
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de tour inválido" }, { status: 400 })
    }

    const data = await request.json()

    // Verificar si el tour existe
    const existingTour = await prisma.tour.findUnique({
      where: { id },
    })

    if (!existingTour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.time !== undefined) updateData.time = data.time
    if (data.duration !== undefined) updateData.duration = Number.parseInt(data.duration)
    if (data.maxParticipants !== undefined) updateData.maxParticipants = Number.parseInt(data.maxParticipants)
    if (data.currentParticipants !== undefined)
      updateData.currentParticipants = Number.parseInt(data.currentParticipants)
    if (data.guide !== undefined) updateData.guide = data.guide
    if (data.status !== undefined) updateData.status = data.status.toUpperCase()
    if (data.category !== undefined) updateData.category = data.category.toUpperCase()
    if (data.price !== undefined) updateData.price = Number.parseFloat(data.price)

    // Actualizar tour
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      tour: updatedTour,
      message: "Tour actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar tour:", error)
    return NextResponse.json({ error: "Error al actualizar el tour" }, { status: 500 })
  }
}

// DELETE - Eliminar un tour específico
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de tour inválido" }, { status: 400 })
    }

    // Verificar si el tour existe
    const existingTour = await prisma.tour.findUnique({
      where: { id },
    })

    if (!existingTour) {
      return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 })
    }

    // Eliminar tour
    await prisma.tour.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Tour eliminado exitosamente",
      tour: existingTour,
    })
  } catch (error) {
    console.error("Error al eliminar tour:", error)
    return NextResponse.json({ error: "Error al eliminar el tour" }, { status: 500 })
  }
}
