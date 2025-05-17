import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de contenido educativo
const contents: any[] = [
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let filteredContents = [...contents]

    // Filtrar por categoría si se proporciona
    if (category) {
      filteredContents = filteredContents.filter((c) => c.category === category)
    }

    // Filtrar contenido destacado si se solicita
    if (featured === "true") {
      filteredContents = filteredContents.filter((c) => c.featured)
    }

    return NextResponse.json({ contents: filteredContents })
  } catch (error) {
    console.error("Error al obtener contenido educativo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, content, image, category, author } = body

    if (!title || !description || !content || !category || !author) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Crear nuevo contenido educativo
    const newContent = {
      id: `${contents.length + 1}`,
      title,
      description,
      content,
      image: image || "/placeholder.svg",
      category,
      author,
      publishedAt: new Date().toISOString(),
      featured: body.featured || false,
    }

    contents.push(newContent)

    return NextResponse.json(
      {
        content: newContent,
        message: "Contenido educativo creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear contenido educativo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
