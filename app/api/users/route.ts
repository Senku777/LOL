import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de usuarios
const users = [
  { id: "1", email: "user@example.com", name: "Usuario Normal", role: "user" },
  { id: "2", email: "admin@example.com", name: "Administrador", role: "admin" },
]

export async function GET(request: NextRequest) {
  try {
    // En una aplicación real, aquí verificaríamos el token JWT y los permisos

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
    }

    // Crear nuevo usuario
    const newUser = {
      id: `${users.length + 1}`,
      email,
      name,
      role,
    }

    users.push(newUser)

    return NextResponse.json(
      {
        user: newUser,
        message: "Usuario creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
