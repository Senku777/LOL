"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { AuthMessage } from "@/components/auth/auth-message"
import { Loader2 } from "lucide-react"

// Mock data for orders
const orders = [
  {
    id: "ORD-1234",
    date: "2023-11-15",
    status: "Entregado",
    total: 24.97,
    items: [
      { name: "Huevos Orgánicos", quantity: 2, price: 5.99 },
      { name: "Pollo Entero", quantity: 1, price: 12.99 },
    ],
  },
  {
    id: "ORD-5678",
    date: "2023-10-28",
    status: "Entregado",
    total: 19.98,
    items: [
      { name: "Huevos Orgánicos", quantity: 1, price: 5.99 },
      { name: "Pechugas de Pollo", quantity: 1, price: 9.99 },
      { name: "Huevos de Codorniz", quantity: 1, price: 3.99 },
    ],
  },
]

// Mock data for subscriptions
const subscriptions = [
  {
    id: "SUB-789",
    plan: "Plan Semanal",
    status: "Activa",
    nextDelivery: "2023-11-22",
    price: 24.99,
  },
]

export default function PerfilPage() {
  const { user, isAuthenticated, updateProfile, loading, error } = useAuth()
  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user) {
      setProfileData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
      })
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await updateProfile({
      nombre: profileData.nombre,
      telefono: profileData.telefono,
    })

    if (success) {
      setSuccessMessage("Perfil actualizado correctamente")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }

  if (!user) return null

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <AuthMessage type="error" message={error} />}
              {successMessage && <AuthMessage type="success" message={successMessage} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/4 flex flex-col items-center">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                      <Image src="/mystical-forest-spirit.png" alt="Avatar" fill className="object-cover" />
                    </div>
                    <Button variant="outline" size="sm">
                      Cambiar Foto
                    </Button>
                  </div>

                  <div className="md:w-3/4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" name="nombre" value={profileData.nombre} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profileData.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={profileData.telefono}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Input
                          id="role"
                          value={user.role === "admin" ? "Administrador" : "Cliente"}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar Cambios"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>Revisa tus pedidos anteriores y su estado</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes pedidos anteriores</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Pedido {order.id}</h3>
                            <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 md:mt-0">
                            <Badge variant="outline">{order.status}</Badge>
                            <span className="font-semibold">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Mis Suscripciones</CardTitle>
              <CardDescription>Gestiona tus planes de suscripción activos</CardDescription>
            </CardHeader>
            <CardContent>
              {!user?.subscription ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes suscripciones activas</p>
                  <Button className="mt-4" asChild>
                    <a href="/suscripciones">Ver Planes</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{user.subscription.planName}</h3>
                          <p className="text-sm text-muted-foreground">ID: {user.subscription.id}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <Badge
                            variant={
                              user.subscription.status === "active"
                                ? "success"
                                : user.subscription.status === "paused"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {user.subscription.status === "active"
                              ? "Activa"
                              : user.subscription.status === "paused"
                                ? "Pausada"
                                : "Cancelada"}
                          </Badge>
                          <span className="font-semibold">
                            ${user.subscription.price.toFixed(2)}/
                            {user.subscription.frequency === "weekly" ? "semana" : "mes"}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Próxima entrega:</span>
                          <span>{new Date(user.subscription.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Método de pago:</span>
                          <span>Tarjeta terminada en 1234</span>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Pausar Suscripción
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Cambiar contraseña</h3>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Cambiar contraseña</Button>
                </form>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Sesiones activas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Este dispositivo</p>
                      <p className="text-sm text-muted-foreground">Última actividad: Ahora</p>
                    </div>
                    <Badge>Activo</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4 text-red-600">Zona de peligro</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que realmente quieres
                  hacer esto.
                </p>
                <Button variant="destructive">Eliminar cuenta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
