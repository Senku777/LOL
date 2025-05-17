"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Eye, AlertCircle, CheckCircle2, XCircle, Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { useToast } from "@/components/ui/use-toast"

// Tipos para las suscripciones
type SubscriptionStatus = "active" | "paused" | "cancelled" | "payment_failed"

type Subscription = {
  id: string
  userId: string
  userName: string
  userEmail: string
  planId: string
  planName: string
  price: number
  frequency: "weekly" | "monthly"
  status: SubscriptionStatus
  startDate: string
  nextBillingDate: string
  lastPaymentDate: string
  paymentMethod: string
}

// Tipos para los planes de suscripción
type SubscriptionPlan = {
  id: string
  name: string
  description: string
  price: number
  frequency: "weekly" | "monthly"
  features: string[]
  isPopular: boolean
  isActive: boolean
}

// Datos de ejemplo para suscripciones
const initialSubscriptions: Subscription[] = [
  {
    id: "sub_123456",
    userId: "user_1",
    userName: "María López",
    userEmail: "maria@example.com",
    planId: "plan_1",
    planName: "Plan Semanal",
    price: 24.99,
    frequency: "weekly",
    status: "active",
    startDate: "2023-06-15",
    nextBillingDate: "2023-07-15",
    lastPaymentDate: "2023-06-15",
    paymentMethod: "Tarjeta terminada en 1234",
  },
  {
    id: "sub_234567",
    userId: "user_2",
    userName: "Carlos Ruiz",
    userEmail: "carlos@example.com",
    planId: "plan_2",
    planName: "Plan Mensual",
    price: 89.99,
    frequency: "monthly",
    status: "paused",
    startDate: "2023-05-10",
    nextBillingDate: "2023-08-10",
    lastPaymentDate: "2023-06-10",
    paymentMethod: "Tarjeta terminada en 5678",
  },
  {
    id: "sub_345678",
    userId: "user_3",
    userName: "Ana García",
    userEmail: "ana@example.com",
    planId: "plan_1",
    planName: "Plan Semanal",
    price: 24.99,
    frequency: "weekly",
    status: "cancelled",
    startDate: "2023-04-20",
    nextBillingDate: "2023-07-20",
    lastPaymentDate: "2023-06-20",
    paymentMethod: "Tarjeta terminada en 9012",
  },
  {
    id: "sub_456789",
    userId: "user_4",
    userName: "Pedro Martínez",
    userEmail: "pedro@example.com",
    planId: "plan_2",
    planName: "Plan Mensual",
    price: 89.99,
    frequency: "monthly",
    status: "payment_failed",
    startDate: "2023-06-05",
    nextBillingDate: "2023-07-05",
    lastPaymentDate: "2023-06-05",
    paymentMethod: "Tarjeta terminada en 3456",
  },
]

// Datos de ejemplo para planes de suscripción
const initialSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_1",
    name: "Plan Semanal",
    description: "Recibe productos frescos cada semana",
    price: 24.99,
    frequency: "weekly",
    features: [
      "Huevos orgánicos (1 docena)",
      "Pollo entero (1 unidad)",
      "Entrega a domicilio",
      "Cambios hasta 24h antes",
      "Acceso a recetas exclusivas",
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: "plan_2",
    name: "Plan Mensual",
    description: "Recibe productos frescos cada mes",
    price: 89.99,
    frequency: "monthly",
    features: [
      "Huevos orgánicos (4 docenas)",
      "Pollo entero (2 unidades)",
      "Pechugas de pollo (2 packs)",
      "Entrega a domicilio gratuita",
      "Cambios hasta 48h antes",
      "Acceso a recetas exclusivas",
      "10% de descuento en productos adicionales",
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: "plan_3",
    name: "Plan Familiar",
    description: "Plan completo para familias",
    price: 129.99,
    frequency: "monthly",
    features: [
      "Huevos orgánicos (6 docenas)",
      "Pollo entero (3 unidades)",
      "Pechugas de pollo (4 packs)",
      "Muslos de pollo (2 packs)",
      "Entrega a domicilio gratuita",
      "Cambios hasta 72h antes",
      "Acceso a recetas exclusivas",
      "15% de descuento en productos adicionales",
    ],
    isPopular: false,
    isActive: false,
  },
]

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans)
  const [activeTab, setActiveTab] = useState("subscriptions")

  // Estados para modales de suscripciones
  const [isEditSubscriptionDialogOpen, setIsEditSubscriptionDialogOpen] = useState(false)
  const [isDeleteSubscriptionDialogOpen, setIsDeleteSubscriptionDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)

  // Estados para modales de planes
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false)
  const [isDeletePlanDialogOpen, setIsDeletePlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: "",
    description: "",
    price: 0,
    frequency: "monthly",
    features: [],
    isPopular: false,
    isActive: true,
  })
  const [newFeature, setNewFeature] = useState("")

  // Funciones para manejar suscripciones
  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsEditSubscriptionDialogOpen(true)
  }

  const handleDeleteSubscriptionClick = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription)
    setIsDeleteSubscriptionDialogOpen(true)
  }

  const handleDeleteSubscription = () => {
    if (subscriptionToDelete) {
      setSubscriptions(subscriptions.filter((sub) => sub.id !== subscriptionToDelete.id))
      toast({
        title: "Suscripción eliminada",
        description: `La suscripción de ${subscriptionToDelete.userName} ha sido eliminada correctamente.`,
      })
      setIsDeleteSubscriptionDialogOpen(false)
      setSubscriptionToDelete(null)
    }
  }

  const handleSaveSubscription = () => {
    if (editingSubscription) {
      setSubscriptions(subscriptions.map((sub) => (sub.id === editingSubscription.id ? editingSubscription : sub)))
      toast({
        title: "Suscripción actualizada",
        description: `La suscripción de ${editingSubscription.userName} ha sido actualizada correctamente.`,
      })
      setIsEditSubscriptionDialogOpen(false)
      setEditingSubscription(null)
    }
  }

  const handleSubscriptionStatusChange = (value: string) => {
    if (editingSubscription) {
      setEditingSubscription({
        ...editingSubscription,
        status: value as SubscriptionStatus,
      })
    }
  }

  // Funciones para manejar planes
  const handleAddNewPlan = () => {
    setEditingPlan(null)
    setNewPlan({
      name: "",
      description: "",
      price: 0,
      frequency: "monthly",
      features: [],
      isPopular: false,
      isActive: true,
    })
    setIsEditPlanDialogOpen(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setNewPlan(plan)
    setIsEditPlanDialogOpen(true)
  }

  const handleDeletePlanClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan)
    setIsDeletePlanDialogOpen(true)
  }

  const handleDeletePlan = () => {
    if (planToDelete) {
      setSubscriptionPlans(subscriptionPlans.filter((plan) => plan.id !== planToDelete.id))
      toast({
        title: "Plan eliminado",
        description: `El plan ${planToDelete.name} ha sido eliminado correctamente.`,
      })
      setIsDeletePlanDialogOpen(false)
      setPlanToDelete(null)
    }
  }

  const handleSavePlan = () => {
    if (editingPlan) {
      // Actualizar plan existente
      const updatedPlan = {
        ...editingPlan,
        ...newPlan,
      }
      setSubscriptionPlans(subscriptionPlans.map((plan) => (plan.id === editingPlan.id ? updatedPlan : plan)))
      toast({
        title: "Plan actualizado",
        description: `El plan ${updatedPlan.name} ha sido actualizado correctamente.`,
      })
    } else {
      // Crear nuevo plan
      const id = `plan_${Date.now()}`
      const newPlanComplete: SubscriptionPlan = {
        id,
        name: newPlan.name || "",
        description: newPlan.description || "",
        price: newPlan.price || 0,
        frequency: newPlan.frequency || "monthly",
        features: newPlan.features || [],
        isPopular: newPlan.isPopular || false,
        isActive: newPlan.isActive || true,
      }
      setSubscriptionPlans([...subscriptionPlans, newPlanComplete])
      toast({
        title: "Plan creado",
        description: `El plan ${newPlanComplete.name} ha sido creado correctamente.`,
      })
    }
    setIsEditPlanDialogOpen(false)
    setEditingPlan(null)
  }

  const handlePlanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const parsedValue = name === "price" ? Number.parseFloat(value) : value
    setNewPlan({ ...newPlan, [name]: parsedValue })
  }

  const handlePlanSelectChange = (name: string, value: string) => {
    setNewPlan({ ...newPlan, [name]: value })
  }

  const handlePlanCheckboxChange = (name: string, checked: boolean) => {
    setNewPlan({ ...newPlan, [name]: checked })
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && newPlan.features) {
      setNewPlan({
        ...newPlan,
        features: [...newPlan.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    if (newPlan.features) {
      const updatedFeatures = [...newPlan.features]
      updatedFeatures.splice(index, 1)
      setNewPlan({
        ...newPlan,
        features: updatedFeatures,
      })
    }
  }

  // Contadores para el dashboard
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length
  const pausedSubscriptions = subscriptions.filter((sub) => sub.status === "paused").length
  const cancelledSubscriptions = subscriptions.filter((sub) => sub.status === "cancelled").length
  const failedSubscriptions = subscriptions.filter((sub) => sub.status === "payment_failed").length

  // Definición de columnas para la tabla de suscripciones
  const subscriptionColumns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "userName",
      header: "Cliente",
      cell: ({ row }) => {
        const userName = row.getValue("userName") as string
        const userEmail = row.original.userEmail
        return (
          <div>
            <div className="font-medium">{userName}</div>
            <div className="text-sm text-muted-foreground">{userEmail}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "planName",
      header: "Plan",
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"))
        const frequency = row.original.frequency
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price)
        return (
          <div>
            {formatted}
            <span className="text-xs text-muted-foreground">/{frequency === "weekly" ? "semana" : "mes"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as SubscriptionStatus

        return (
          <Badge
            variant={
              status === "active"
                ? "success"
                : status === "paused"
                  ? "outline"
                  : status === "cancelled"
                    ? "destructive"
                    : "default"
            }
          >
            {status === "active"
              ? "Activa"
              : status === "paused"
                ? "Pausada"
                : status === "cancelled"
                  ? "Cancelada"
                  : "Pago fallido"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "nextBillingDate",
      header: "Próximo cobro",
      cell: ({ row }) => {
        const date = new Date(row.getValue("nextBillingDate"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscription = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Detalles de Suscripción</DialogTitle>
                  <DialogDescription>Información detallada de la suscripción.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">ID de Suscripción</h3>
                      <p>{subscription.id}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Estado</h3>
                      <Badge
                        variant={
                          subscription.status === "active"
                            ? "success"
                            : subscription.status === "paused"
                              ? "outline"
                              : subscription.status === "cancelled"
                                ? "destructive"
                                : "default"
                        }
                      >
                        {subscription.status === "active"
                          ? "Activa"
                          : subscription.status === "paused"
                            ? "Pausada"
                            : subscription.status === "cancelled"
                              ? "Cancelada"
                              : "Pago fallido"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Cliente</h3>
                    <p>{subscription.userName}</p>
                    <p className="text-sm text-muted-foreground">{subscription.userEmail}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Plan</h3>
                      <p>{subscription.planName}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Precio</h3>
                      <p>
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        }).format(subscription.price)}
                        /{subscription.frequency === "weekly" ? "semana" : "mes"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Fecha de inicio</h3>
                      <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Último pago</h3>
                      <p>{new Date(subscription.lastPaymentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Próximo cobro</h3>
                      <p>{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Método de pago</h3>
                    <p>{subscription.paymentMethod}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => handleEditSubscription(subscription)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteSubscriptionClick(subscription)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Definición de columnas para la tabla de planes
  const planColumns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"))
        const frequency = row.original.frequency
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price)
        return (
          <div>
            {formatted}
            <span className="text-xs text-muted-foreground">/{frequency === "weekly" ? "semana" : "mes"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "frequency",
      header: "Frecuencia",
      cell: ({ row }) => {
        const frequency = row.getValue("frequency") as string
        return frequency === "weekly" ? "Semanal" : "Mensual"
      },
    },
    {
      accessorKey: "isPopular",
      header: "Popular",
      cell: ({ row }) => {
        const isPopular = row.getValue("isPopular") as boolean
        return isPopular ? <Badge variant="default">Popular</Badge> : null
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return isActive ? <Badge variant="success">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const plan = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeletePlanClick(plan)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Pausadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos Fallidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="plans">Planes</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="space-y-4">
          <DataTable
            columns={subscriptionColumns}
            data={subscriptions}
            searchKey="userName"
            searchPlaceholder="Buscar por nombre o email..."
            filterKey="status"
            filterOptions={[
              { label: "Activas", value: "active" },
              { label: "Pausadas", value: "paused" },
              { label: "Canceladas", value: "cancelled" },
              { label: "Pago fallido", value: "payment_failed" },
            ]}
          />
        </TabsContent>
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddNewPlan}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Plan
            </Button>
          </div>
          <DataTable
            columns={planColumns}
            data={subscriptionPlans}
            searchKey="name"
            searchPlaceholder="Buscar por nombre..."
            filterKey="frequency"
            filterOptions={[
              { label: "Semanal", value: "weekly" },
              { label: "Mensual", value: "monthly" },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Modal para editar suscripción */}
      <Dialog open={isEditSubscriptionDialogOpen} onOpenChange={setIsEditSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Suscripción</DialogTitle>
            <DialogDescription>Modifica los datos de la suscripción.</DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Cliente</Label>
                  <Input id="userName" value={editingSubscription.userName} disabled />
                </div>
                <div>
                  <Label htmlFor="planName">Plan</Label>
                  <Input id="planName" value={editingSubscription.planName} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={editingSubscription.status} onValueChange={handleSubscriptionStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="payment_failed">Pago fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextBillingDate">Próximo cobro</Label>
                  <Input
                    id="nextBillingDate"
                    type="date"
                    value={editingSubscription.nextBillingDate}
                    onChange={(e) =>
                      setEditingSubscription({ ...editingSubscription, nextBillingDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Método de pago</Label>
                  <Input
                    id="paymentMethod"
                    value={editingSubscription.paymentMethod}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, paymentMethod: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubscriptionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubscription}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar suscripción */}
      <AlertDialog open={isDeleteSubscriptionDialogOpen} onOpenChange={setIsDeleteSubscriptionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la suscripción de {subscriptionToDelete?.userName}. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubscription} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear/editar plan */}
      <Dialog open={isEditPlanDialogOpen} onOpenChange={setIsEditPlanDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Editar Plan" : "Nuevo Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Modifica los datos del plan" : "Completa el formulario para crear un nuevo plan"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre del plan"
                value={newPlan.name}
                onChange={handlePlanInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del plan"
                value={newPlan.description}
                onChange={handlePlanInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newPlan.price}
                  onChange={handlePlanInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select value={newPlan.frequency} onValueChange={(value) => handlePlanSelectChange("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Características</Label>
              <div className="space-y-2">
                {newPlan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={feature} disabled />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nueva característica"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleAddFeature}>
                    Añadir
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={newPlan.isPopular}
                onChange={(e) => handlePlanCheckboxChange("isPopular", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isPopular">Marcar como popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newPlan.isActive}
                onChange={(e) => handlePlanCheckboxChange("isActive", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive">Plan activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>{editingPlan ? "Guardar cambios" : "Crear plan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar plan */}
      <AlertDialog open={isDeletePlanDialogOpen} onOpenChange={setIsDeletePlanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el plan {planToDelete?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
