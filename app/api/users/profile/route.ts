import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de usuarios
const users = [
  { id: "1", email: "user@example.com", name: "Usuario Normal", role: "user" },
  { id: "2", email: "admin@example.com", name: "Administrador", role: "admin" },
]

export async function GET(request: NextRequest) {
  try {
    // En una aplicación real, aquí obtendríamos el ID del usuario del token JWT
    const userId = "1" // Simulamos que el usuario actual es el ID 1

    // Buscar usuario por ID
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // En una aplicación real, aquí obtendríamos el ID del usuario del token JWT
    const userId = "1" // Simulamos que el usuario actual es el ID 1

    const body = await request.json()
    const { name, email } = body

    // Buscar usuario por ID
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar usuario
    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
    }

    return NextResponse.json({
      user: users[userIndex],
      message: "Perfil actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
