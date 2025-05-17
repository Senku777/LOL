import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // En una aplicación real, aquí invalidaríamos el token JWT

    return NextResponse.json({
      message: "Sesión cerrada exitosamente",
    })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
