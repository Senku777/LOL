import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de contenido educativo
let contents: any[] = [
  {
    id: "1",
    title: "Beneficios de los huevos orgánicos",
    description: "Descubre por qué los huevos orgánicos son mejores para tu salud y el medio ambiente.",
    content: "Los huevos orgánicos provienen de gallinas criadas en libertad...",
    image: "/free-range-chickens.png",
    category: "Nutrición",
    author: "Dr. Ana García",
    publishedAt: "2023-01-15T10:00:00Z",
    featured: true,
  },
  {
    id: "2",
    title: "Cómo criar pollos en casa",
    description: "Guía completa para criar pollos en tu propio jardín.",
    content: "Criar pollos en casa es más sencillo de lo que piensas...",
    image: "/modern-poultry-farm.png",
    category: "Guías",
    author: "Carlos Martínez",
    publishedAt: "2023-02-20T14:30:00Z",
    featured: false,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar contenido por ID
    const content = contents.find((c) => c.id === id)

    if (!content) {
      return NextResponse.json({ error: "Contenido educativo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error al obtener contenido educativo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Buscar contenido por ID
    const contentIndex = contents.findIndex((c) => c.id === id)

    if (contentIndex === -1) {
      return NextResponse.json({ error: "Contenido educativo no encontrado" }, { status: 404 })
    }

    // Actualizar contenido
    contents[contentIndex] = {
      ...contents[contentIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      content: contents[contentIndex],
      message: "Contenido educativo actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar contenido educativo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar contenido por ID
    const contentIndex = contents.findIndex((c) => c.id === id)

    if (contentIndex === -1) {
      return NextResponse.json({ error: "Contenido educativo no encontrado" }, { status: 404 })
    }

    // Eliminar contenido
    const deletedContent = contents[contentIndex]
    contents = contents.filter((c) => c.id !== id)

    return NextResponse.json({
      message: "Contenido educativo eliminado exitosamente",
      content: deletedContent,
    })
  } catch (error) {
    console.error("Error al eliminar contenido educativo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
