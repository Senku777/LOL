import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Obtener categorías únicas directamente desde la base de datos
    const categories = await prisma.product.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc'
      }
    })

    // Extraer solo los valores de categoría
    const categoryValues = categories.map((item) => item.category)

    return NextResponse.json({ categories: categoryValues })
  } catch (error) {
    console.error("Error GET /api/products/categories:", error)
    
    return NextResponse.json(
      { 
        error: "Error al obtener categorías",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}