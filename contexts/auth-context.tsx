"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Tipos
export type UserRole = "ADMIN" | "EMPLEADO" | "CLIENTE"

export type Subscription = {
  id: string
  planId: string
  planName: string
  status: "ACTIVE" | "PAUSED" | "CANCELLED"
  startDate: string
  nextBillingDate: string
  price: number
  frequency: string
}

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  createdAt: string
  subscription?: Subscription | null
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string) => Promise<boolean>
  setNewPassword: (token: string, password: string) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  isAuthenticated: boolean
  isAdmin: boolean
  hasActiveSubscription: boolean
  loading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  resetPassword: async () => false,
  setNewPassword: async () => false,
  updateProfile: async () => false,
  isAuthenticated: false,
  isAdmin: false,
  hasActiveSubscription: false,
  loading: false,
  error: null,
  clearError: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Verificar si hay un usuario y token en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("brotato-user")
    const storedToken = localStorage.getItem("brotato-token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const clearError = () => setError(null)

  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        return false
      }

      setUser(data.user)
      setToken(data.token)

      if (remember) {
        localStorage.setItem("brotato-user", JSON.stringify(data.user))
        localStorage.setItem("brotato-token", data.token)
      }

      return true
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al registrar usuario")
        return false
      }

      // No iniciar sesión automáticamente después del registro
      // El usuario debe iniciar sesión manualmente

      return true
    } catch (err) {
      setError("Error al registrar usuario. Inténtalo de nuevo.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("brotato-user")
    localStorage.removeItem("brotato-token")
    router.push("/auth/login")
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al procesar la solicitud")
        return false
      }

      return true
    } catch (err) {
      setError("Error al procesar la solicitud. Inténtalo de nuevo.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const setNewPassword = async (token: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al cambiar la contraseña")
        return false
      }

      return true
    } catch (err) {
      setError("Error al cambiar la contraseña. El enlace puede haber expirado.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      if (!token || !user) {
        setError("No has iniciado sesión")
        return false
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al actualizar el perfil")
        return false
      }

      const updatedUser = { ...user, ...data.user }
      setUser(updatedUser)
      localStorage.setItem("brotato-user", JSON.stringify(updatedUser))

      return true
    } catch (err) {
      setError("Error al actualizar el perfil. Inténtalo de nuevo.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const isAuthenticated = user !== null && token !== null
  const isAdmin = user?.role === "ADMIN"
  const hasActiveSubscription = user?.subscription?.status === "ACTIVE"

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        resetPassword,
        setNewPassword,
        updateProfile,
        isAuthenticated,
        isAdmin,
        hasActiveSubscription,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
