"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Phone, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ColumnDef } from "@tanstack/react-table"

// Tipo para los proveedores
type SupplierCategory = "feed" | "equipment" | "packaging" | "transport" | "other"

type Supplier = {
  id: number
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  category: SupplierCategory
  status: "active" | "inactive"
  createdAt: string
  notes?: string
}

// Datos de ejemplo para proveedores
const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Piensos Naturales S.L.",
    contactName: "Juan Pérez",
    email: "juan@piensosnatural.es",
    phone: "612345678",
    address: "Calle Agricultura 23, Madrid",
    category: "feed",
    status: "active",
    createdAt: "2023-01-15",
    notes: "Proveedor principal de piensos ecológicos",
  },
  {
    id: 2,
    name: "Equipos Avícolas Modernos",
    contactName: "María Gómez",
    email: "maria@equiposavicolas.com",
    phone: "623456789",
    address: "Avenida Industrial 45, Barcelona",
    category: "equipment",
    status: "active",
    createdAt: "2023-02-20",
  },
  {
    id: 3,
    name: "Envases Ecológicos",
    contactName: "Pedro Sánchez",
    email: "pedro@envaseseco.es",
    phone: "634567890",
    address: "Polígono Industrial Norte 12, Valencia",
    category: "packaging",
    status: "inactive",
    createdAt: "2023-03-10",
  },
  {
    id: 4,
    name: "Transportes Rápidos",
    contactName: "Ana Martínez",
    email: "ana@transportesrapidos.com",
    phone: "645678901",
    address: "Calle Logística 78, Sevilla",
    category: "transport",
    status: "active",
    createdAt: "2023-04-05",
  },
  {
    id: 5,
    name: "Servicios Veterinarios Avícolas",
    contactName: "Carlos Ruiz",
    email: "carlos@vetavicola.es",
    phone: "656789012",
    address: "Calle Salud Animal 34, Zaragoza",
    category: "other",
    status: "active",
    createdAt: "2023-05-12",
  },
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    category: "feed",
    status: "active",
    notes: "",
  })

  // Función para manejar cambios en el formulario
  const handleFormChange = (field: keyof Supplier, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Función para abrir el diálogo de edición
  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setFormData(supplier)
    setIsEditDialogOpen(true)
  }

  // Función para abrir el diálogo de eliminación
  const handleDelete = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  // Función para guardar un nuevo proveedor
  const handleSaveNew = () => {
    const newSupplier: Supplier = {
      id: suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1,
      name: formData.name || "",
      contactName: formData.contactName || "",
      email: formData.email || "",
      phone: formData.phone || "",
      address: formData.address || "",
      category: (formData.category as SupplierCategory) || "feed",
      status: (formData.status as "active" | "inactive") || "active",
      createdAt: new Date().toISOString().split("T")[0],
      notes: formData.notes,
    }

    setSuppliers([...suppliers, newSupplier])
    setIsAddDialogOpen(false)
    resetForm()
    toast({
      title: "Proveedor añadido",
      description: `${newSupplier.name} ha sido añadido correctamente.`,
    })
  }

  // Función para actualizar un proveedor existente
  const handleUpdate = () => {
    if (!currentSupplier) return

    const updatedSuppliers = suppliers.map((supplier) =>
      supplier.id === currentSupplier.id
        ? {
            ...supplier,
            name: formData.name || supplier.name,
            contactName: formData.contactName || supplier.contactName,
            email: formData.email || supplier.email,
            phone: formData.phone || supplier.phone,
            address: formData.address || supplier.address,
            category: (formData.category as SupplierCategory) || supplier.category,
            status: (formData.status as "active" | "inactive") || supplier.status,
            notes: formData.notes,
          }
        : supplier,
    )

    setSuppliers(updatedSuppliers)
    setIsEditDialogOpen(false)
    resetForm()
    toast({
      title: "Proveedor actualizado",
      description: `${formData.name} ha sido actualizado correctamente.`,
    })
  }

  // Función para eliminar un proveedor
  const handleConfirmDelete = () => {
    if (!currentSupplier) return

    const filteredSuppliers = suppliers.filter((supplier) => supplier.id !== currentSupplier.id)
    setSuppliers(filteredSuppliers)
    setIsDeleteDialogOpen(false)
    toast({
      title: "Proveedor eliminado",
      description: `${currentSupplier.name} ha sido eliminado correctamente.`,
      variant: "destructive",
    })
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      category: "feed",
      status: "active",
      notes: "",
    })
    setCurrentSupplier(null)
  }

  // Función para abrir el diálogo de añadir
  const handleAdd = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  // Definición de columnas para la tabla
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "contactName",
      header: "Contacto",
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.getValue("category") as SupplierCategory
        const categoryLabels = {
          feed: "Alimentación",
          equipment: "Equipamiento",
          packaging: "Embalaje",
          transport: "Transporte",
          other: "Otros",
        }
        return (
          <Badge variant="outline" className="capitalize">
            {categoryLabels[category]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return status === "active" ? <Badge variant="success">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>
      },
    },
    {
      accessorKey: "email",
      header: "Contacto",
      cell: ({ row }) => {
        const email = row.getValue("email") as string
        const phone = row.original.phone
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span>{email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span>{phone}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const supplier = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(supplier)}
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
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Buscar por nombre..."
        filterKey="category"
        filterOptions={[
          { label: "Alimentación", value: "feed" },
          { label: "Equipamiento", value: "equipment" },
          { label: "Embalaje", value: "packaging" },
          { label: "Transporte", value: "transport" },
          { label: "Otros", value: "other" },
        ]}
      />

      {/* Diálogo para añadir nuevo proveedor */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
            <DialogDescription>Completa el formulario para añadir un nuevo proveedor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la empresa</Label>
                <Input
                  id="name"
                  placeholder="Nombre de la empresa"
                  value={formData.name || ""}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nombre de contacto</Label>
                <Input
                  id="contactName"
                  placeholder="Nombre de la persona de contacto"
                  value={formData.contactName || ""}
                  onChange={(e) => handleFormChange("contactName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.email || ""}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="612345678"
                  value={formData.phone || ""}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Dirección completa"
                value={formData.address || ""}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleFormChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Alimentación</SelectItem>
                    <SelectItem value="equipment">Equipamiento</SelectItem>
                    <SelectItem value="packaging">Embalaje</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el proveedor"
                value={formData.notes || ""}
                onChange={(e) => handleFormChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNew}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar proveedor */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>Actualiza la información del proveedor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre de la empresa</Label>
                <Input
                  id="edit-name"
                  placeholder="Nombre de la empresa"
                  value={formData.name || ""}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactName">Nombre de contacto</Label>
                <Input
                  id="edit-contactName"
                  placeholder="Nombre de la persona de contacto"
                  value={formData.contactName || ""}
                  onChange={(e) => handleFormChange("contactName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.email || ""}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  placeholder="612345678"
                  value={formData.phone || ""}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                placeholder="Dirección completa"
                value={formData.address || ""}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleFormChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Alimentación</SelectItem>
                    <SelectItem value="equipment">Equipamiento</SelectItem>
                    <SelectItem value="packaging">Embalaje</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas adicionales</Label>
              <Textarea
                id="edit-notes"
                placeholder="Información adicional sobre el proveedor"
                value={formData.notes || ""}
                onChange={(e) => handleFormChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al proveedor {currentSupplier?.name}. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
