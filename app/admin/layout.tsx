"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no es administrador o no está autenticado
    if (!isAuthenticated || !isAdmin) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isAdmin, router])

  // Si no es administrador, no mostrar el contenido
  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}
