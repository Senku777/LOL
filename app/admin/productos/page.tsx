"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Plus, AlertTriangle, ImageIcon, Loader2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  oldPrice?: number | null
  category: string
  stock: number
  minStock: number
  isSubscription: boolean
  subscriptionFrequency?: "weekly" | "monthly" | null
  image?: string | null
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isSubscription, setIsSubscription] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "huevos",
    stock: 0,
    minStock: 0,
    isSubscription: false,
  })

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const { products } = await response.json()
        setProducts(products)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsSubscription(product.isSubscription)
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || undefined,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      isSubscription: product.isSubscription,
      subscriptionFrequency: product.subscriptionFrequency || undefined,
      image: product.image || undefined,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products?id=${productToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error("Error al eliminar producto")

      setProducts(products.filter((product) => product.id !== productToDelete.id))
      toast({
        title: "Producto eliminado",
        description: `El producto ${productToDelete.name} ha sido eliminado correctamente.`,
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleAddNewProduct = () => {
    setEditingProduct(null)
    setIsSubscription(false)
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      category: "huevos",
      stock: 0,
      minStock: 0,
      isSubscription: false,
    })
    setIsDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        isSubscription,
        oldPrice: newProduct.oldPrice || null,
        subscriptionFrequency: isSubscription ? newProduct.subscriptionFrequency || "monthly" : null,
        stock: isSubscription ? 999 : newProduct.stock || 0,
        minStock: isSubscription ? 0 : newProduct.minStock || 0,
      }

      let response
      if (editingProduct) {
        // Actualizar producto existente
        response = await fetch(`/api/products`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProduct.id,
            ...productData
          })
        })
      } else {
        // Crear nuevo producto
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        })
      }

      if (!response.ok) throw new Error("Error al guardar producto")
      
      const { product } = await response.json()

      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? product : p))
        toast({
          title: "Producto actualizado",
          description: `El producto ${product.name} ha sido actualizado correctamente.`,
        })
      } else {
        setProducts([...products, product])
        toast({
          title: "Producto creado",
          description: `El producto ${product.name} ha sido creado correctamente.`,
        })
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const parsedValue =
      name === "price" || name === "oldPrice" || name === "stock" || name === "minStock"
        ? Number.parseFloat(value)
        : value

    setNewProduct({ ...newProduct, [name]: parsedValue })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct({ ...newProduct, [name]: value })
  }

  const handleSubscriptionChange = (checked: boolean) => {
    setIsSubscription(checked)
    if (checked) {
      setNewProduct({
        ...newProduct,
        stock: 999,
        minStock: 0,
        category: "suscripcion",
      })
    }
  }

  // Definición de columnas para la tabla
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge variant="outline" className="capitalize">
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price)
        return formatted
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = Number.parseInt(row.getValue("stock"))
        const minStock = row.original.minStock
        const isSubscription = row.original.isSubscription

        if (isSubscription) {
          return <span>Ilimitado</span>
        }

        return (
          <div className="flex items-center">
            {stock <= minStock && (
              <AlertTriangle className={cn("mr-2 h-4 w-4", stock === 0 ? "text-red-500" : "text-amber-500")} />
            )}
            <span className={cn(stock === 0 ? "text-red-500" : stock <= minStock ? "text-amber-500" : "")}>
              {stock}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "isSubscription",
      header: "Tipo",
      cell: ({ row }) => {
        const isSubscription = row.original.isSubscription
        return isSubscription ? <Badge>Suscripción</Badge> : <Badge variant="outline">Producto</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteClick(product)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button onClick={handleAddNewProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Buscar por nombre..."
        filterKey="category"
        filterOptions={[
          { label: "Huevos", value: "huevos" },
          { label: "Carne", value: "carne" },
          { label: "Suscripción", value: "suscripcion" },
        ]}
      />

      {/* Modal para crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto"
                : "Completa el formulario para crear un nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre del producto"
                  value={newProduct.name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newProduct.category || "huevos"}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="huevos">Huevos</SelectItem>
                    <SelectItem value="carne">Carne</SelectItem>
                    <SelectItem value="suscripcion">Suscripción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del producto"
                value={newProduct.description || ""}
                onChange={handleInputChange}
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
                  value={newProduct.price || 0}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPrice">Precio anterior (€) (opcional)</Label>
                <Input
                  id="oldPrice"
                  name="oldPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newProduct.oldPrice || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isSubscription" checked={isSubscription} onCheckedChange={handleSubscriptionChange} />
              <Label htmlFor="isSubscription">Es un producto de suscripción</Label>
            </div>
            {isSubscription ? (
              <div className="space-y-2">
                <Label htmlFor="subscriptionFrequency">Frecuencia de suscripción</Label>
                <Select
                  value={newProduct.subscriptionFrequency || "monthly"}
                  onValueChange={(value) => handleSelectChange("subscriptionFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock || 0}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Stock mínimo</Label>
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.minStock || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="image">Imagen del producto</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-40 rounded-md overflow-hidden border">
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline">Subir imagen</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>{editingProduct ? "Guardar cambios" : "Crear producto"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto {productToDelete?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}