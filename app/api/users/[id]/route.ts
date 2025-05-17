import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de usuarios
let users = [
  { id: "1", email: "user@example.com", name: "Usuario Normal", role: "user" },
  { id: "2", email: "admin@example.com", name: "Administrador", role: "admin" },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar usuario por ID
    const user = users.find((u) => u.id === id)

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { email, name, role } = body

    // Buscar usuario por ID
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar usuario
    users[userIndex] = {
      ...users[userIndex],
      ...(email && { email }),
      ...(name && { name }),
      ...(role && { role }),
    }

    return NextResponse.json({
      user: users[userIndex],
      message: "Usuario actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar usuario por ID
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar usuario
    const deletedUser = users[userIndex]
    users = users.filter((u) => u.id !== id)

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
      user: deletedUser,
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
