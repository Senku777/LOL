import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de entradas de blog
const blogPosts = [
  {
    id: "1",
    title: "Beneficios de la agricultura sostenible",
    category: "Sostenibilidad",
  },
  {
    id: "2",
    title: "Cómo elegir los mejores huevos orgánicos",
    category: "Alimentación",
  },
  {
    id: "3",
    title: "El bienestar animal en la producción avícola",
    category: "Bienestar Animal",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Obtener categorías únicas
    const categories = [...new Set(blogPosts.map((p) => p.category))]

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
