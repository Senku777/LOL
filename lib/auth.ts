// /lib/auth.ts
import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import prisma from "./prisma"

// Tipos
export type JWTPayload = {
  id: string
  email: string
  role: string
}

// Función para generar un token JWT (corregida)
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET as jwt.Secret, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  )
}

// Función para verificar un token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as JWTPayload
  } catch (error) {
    return null
  }
}

// Función para obtener el usuario actual (nueva)
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") || 
                request.cookies.get("token")?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // Verificar si el usuario existe en la base de datos
  const userExists = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true }
  })

  return userExists ? payload : null
}

// Middlewares y funciones de utilidad (se mantienen igual)
export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
  }

  return null
}

export async function adminMiddleware(request: NextRequest) {
  const authError = await authMiddleware(request)

  if (authError) {
    return authError
  }

  const token = request.headers.get("Authorization")?.replace("Bearer ", "")
  const payload = verifyToken(token!)

  if (payload?.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  return null
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}