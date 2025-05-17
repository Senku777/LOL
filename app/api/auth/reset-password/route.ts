import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Correo electrónico es requerido" }, { status: 400 })
    }

    // En una aplicación real, aquí enviaríamos un correo con un enlace para restablecer la contraseña

    return NextResponse.json({
      message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
    })
  } catch (error) {
    console.error("Error en reset-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
