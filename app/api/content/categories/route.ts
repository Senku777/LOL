import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de contenido educativo
const contents = [
  {
    id: "1",
    title: "Beneficios de los huevos orgánicos",
    category: "Nutrición",
  },
  {
    id: "2",
    title: "Cómo criar pollos en casa",
    category: "Guías",
  },
  {
    id: "3",
    title: "Recetas con huevos frescos",
    category: "Recetas",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Obtener categorías únicas
    const categories = [...new Set(contents.map((c) => c.category))]

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
