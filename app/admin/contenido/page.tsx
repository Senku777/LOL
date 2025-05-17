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
import { Pencil, Trash2, Plus, FileText, Video, ImageIcon, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

// Tipos para el contenido educativo
type ContentType = "article" | "video" | "infographic"

type EducationalContent = {
  id: number
  title: string
  description: string
  content: string
  type: ContentType
  image: string
  author: string
  publishDate: string
  status: "published" | "draft"
  tags: string[]
}

// Datos de ejemplo para contenido educativo
const initialEducationalContent: EducationalContent[] = [
  {
    id: 1,
    title: "Beneficios de los huevos orgánicos",
    description:
      "Descubre por qué los huevos de gallinas criadas en libertad son mejores para tu salud y el medio ambiente.",
    content: "Contenido completo del artículo...",
    type: "article",
    image: "/carton-organic-eggs.png",
    author: "María García",
    publishDate: "2023-05-15",
    status: "published",
    tags: ["huevos", "orgánico", "salud"],
  },
  {
    id: 2,
    title: "Cómo criar pollos de manera sostenible",
    description:
      "Aprende sobre las prácticas sostenibles que utilizamos en nuestra granja para criar pollos felices y saludables.",
    content: "Contenido completo del artículo...",
    type: "article",
    image: "/free-range-chickens.png",
    author: "Juan Pérez",
    publishDate: "2023-06-22",
    status: "published",
    tags: ["pollos", "sostenibilidad", "bienestar animal"],
  },
  {
    id: 3,
    title: "Recetas con pollo orgánico",
    description: "5 recetas deliciosas y saludables que puedes preparar con nuestro pollo orgánico.",
    content: "Contenido completo del artículo...",
    type: "article",
    image: "/grilled-chicken-platter.png",
    author: "Ana Martínez",
    publishDate: "2023-07-10",
    status: "draft",
    tags: ["recetas", "pollo", "cocina"],
  },
  {
    id: 4,
    title: "Tour virtual por nuestra granja",
    description: "Conoce nuestras instalaciones y cómo cuidamos a nuestras aves en este video tour.",
    content: "URL del video",
    type: "video",
    image: "/aerial-chicken-farm.png",
    author: "Carlos Rodríguez",
    publishDate: "2023-08-05",
    status: "published",
    tags: ["granja", "instalaciones", "video"],
  },
  {
    id: 5,
    title: "Diferencias entre huevos convencionales y orgánicos",
    description: "Infografía comparativa entre los huevos convencionales y orgánicos.",
    content: "URL de la infografía",
    type: "infographic",
    image: "/egg-comparison.png",
    author: "Laura Sánchez",
    publishDate: "2023-09-18",
    status: "published",
    tags: ["huevos", "comparativa", "infografía"],
  },
]

export default function EducationalContentPage() {
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>(initialEducationalContent)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<EducationalContent | null>(null)
  const [formData, setFormData] = useState<Partial<EducationalContent>>({
    title: "",
    description: "",
    content: "",
    type: "article",
    image: "",
    author: "",
    status: "draft",
    tags: [],
  })

  // Función para manejar cambios en el formulario
  const handleFormChange = (field: keyof EducationalContent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Función para manejar cambios en las etiquetas
  const handleTagsChange = (tagsString: string) => {
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  // Función para abrir el diálogo de visualización
  const handleView = (content: EducationalContent) => {
    setCurrentContent(content)
    setIsViewDialogOpen(true)
  }

  // Función para abrir el diálogo de edición
  const handleEdit = (content: EducationalContent) => {
    setCurrentContent(content)
    setFormData({
      ...content,
      tags: content.tags,
    })
    setIsEditDialogOpen(true)
  }

  // Función para abrir el diálogo de eliminación
  const handleDelete = (content: EducationalContent) => {
    setCurrentContent(content)
    setIsDeleteDialogOpen(true)
  }

  // Función para guardar nuevo contenido
  const handleSaveNew = () => {
    const newContent: EducationalContent = {
      id: educationalContent.length > 0 ? Math.max(...educationalContent.map((c) => c.id)) + 1 : 1,
      title: formData.title || "",
      description: formData.description || "",
      content: formData.content || "",
      type: (formData.type as ContentType) || "article",
      image: formData.image || "/placeholder.svg",
      author: formData.author || "",
      publishDate: new Date().toISOString().split("T")[0],
      status: (formData.status as "published" | "draft") || "draft",
      tags: formData.tags || [],
    }

    setEducationalContent([...educationalContent, newContent])
    setIsAddDialogOpen(false)
    resetForm()
    toast({
      title: "Contenido añadido",
      description: `${newContent.title} ha sido añadido correctamente.`,
    })
  }

  // Función para actualizar contenido existente
  const handleUpdate = () => {
    if (!currentContent) return

    const updatedContent = educationalContent.map((content) =>
      content.id === currentContent.id
        ? {
            ...content,
            title: formData.title || content.title,
            description: formData.description || content.description,
            content: formData.content || content.content,
            type: (formData.type as ContentType) || content.type,
            image: formData.image || content.image,
            author: formData.author || content.author,
            status: (formData.status as "published" | "draft") || content.status,
            tags: formData.tags || content.tags,
          }
        : content,
    )

    setEducationalContent(updatedContent)
    setIsEditDialogOpen(false)
    resetForm()
    toast({
      title: "Contenido actualizado",
      description: `${formData.title} ha sido actualizado correctamente.`,
    })
  }

  // Función para eliminar contenido
  const handleConfirmDelete = () => {
    if (!currentContent) return

    const filteredContent = educationalContent.filter((content) => content.id !== currentContent.id)
    setEducationalContent(filteredContent)
    setIsDeleteDialogOpen(false)
    toast({
      title: "Contenido eliminado",
      description: `${currentContent.title} ha sido eliminado correctamente.`,
      variant: "destructive",
    })
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      type: "article",
      image: "",
      author: "",
      status: "draft",
      tags: [],
    })
    setCurrentContent(null)
  }

  // Función para abrir el diálogo de añadir
  const handleAdd = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  // Definición de columnas para la tabla
  const columns: ColumnDef<EducationalContent>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => {
        const title = row.getValue("title") as string
        const description = row.original.description
        return (
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground line-clamp-1">{description}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as ContentType
        const typeIcons = {
          article: <FileText className="h-4 w-4 mr-2" />,
          video: <Video className="h-4 w-4 mr-2" />,
          infographic: <ImageIcon className="h-4 w-4 mr-2" />,
        }
        const typeLabels = {
          article: "Artículo",
          video: "Video",
          infographic: "Infografía",
        }
        return (
          <div className="flex items-center">
            {typeIcons[type]}
            <span>{typeLabels[type]}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "image",
      header: "Imagen",
      cell: ({ row }) => {
        const image = row.getValue("image") as string
        return (
          <div className="relative h-12 w-20 rounded-md overflow-hidden">
            <Image src={image || "/placeholder.svg"} alt="Thumbnail" fill className="object-cover" />
          </div>
        )
      },
    },
    {
      accessorKey: "author",
      header: "Autor",
    },
    {
      accessorKey: "publishDate",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.getValue("publishDate"))
        return date.toLocaleDateString()
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return status === "published" ? (
          <Badge variant="success">Publicado</Badge>
        ) : (
          <Badge variant="outline">Borrador</Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const content = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleView(content)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(content)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(content)}
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
        <h1 className="text-3xl font-bold">Contenido Educativo</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contenido
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={educationalContent}
        searchKey="title"
        searchPlaceholder="Buscar por título..."
        filterKey="type"
        filterOptions={[
          { label: "Artículo", value: "article" },
          { label: "Video", value: "video" },
          { label: "Infografía", value: "infographic" },
        ]}
      />

      {/* Diálogo para añadir nuevo contenido */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Nuevo Contenido Educativo</DialogTitle>
            <DialogDescription>Completa el formulario para crear nuevo contenido educativo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de contenido</Label>
              <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artículo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="infographic">Infografía</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título del contenido"
                value={formData.title || ""}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del contenido"
                value={formData.description || ""}
                onChange={(e) => handleFormChange("description", e.target.value)}
              />
            </div>
            {formData.type === "article" ? (
              <div className="space-y-2">
                <Label htmlFor="content">Contenido del artículo</Label>
                <Textarea
                  id="content"
                  placeholder="Contenido completo del artículo"
                  rows={10}
                  value={formData.content || ""}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="contentUrl">
                  {formData.type === "video" ? "URL del video" : "URL de la infografía"}
                </Label>
                <Input
                  id="contentUrl"
                  placeholder="https://"
                  value={formData.content || ""}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="image">Imagen destacada</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-40 rounded-md overflow-hidden border">
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    {formData.image ? (
                      <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    id="image"
                    placeholder="URL de la imagen o ruta"
                    value={formData.image || ""}
                    onChange={(e) => handleFormChange("image", e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    Seleccionar imagen
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  placeholder="Nombre del autor"
                  value={formData.author || ""}
                  onChange={(e) => handleFormChange("author", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="tags"
                  placeholder="huevos, orgánico, salud"
                  value={formData.tags ? formData.tags.join(", ") : ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Diálogo para editar contenido */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Editar Contenido Educativo</DialogTitle>
            <DialogDescription>Actualiza la información del contenido educativo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo de contenido</Label>
              <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artículo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="infographic">Infografía</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                placeholder="Título del contenido"
                value={formData.title || ""}
                onChange={(e) => handleFormChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                placeholder="Breve descripción del contenido"
                value={formData.description || ""}
                onChange={(e) => handleFormChange("description", e.target.value)}
              />
            </div>
            {formData.type === "article" ? (
              <div className="space-y-2">
                <Label htmlFor="edit-content">Contenido del artículo</Label>
                <Textarea
                  id="edit-content"
                  placeholder="Contenido completo del artículo"
                  rows={10}
                  value={formData.content || ""}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit-contentUrl">
                  {formData.type === "video" ? "URL del video" : "URL de la infografía"}
                </Label>
                <Input
                  id="edit-contentUrl"
                  placeholder="https://"
                  value={formData.content || ""}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-image">Imagen destacada</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-40 rounded-md overflow-hidden border">
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    {formData.image ? (
                      <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    id="edit-image"
                    placeholder="URL de la imagen o ruta"
                    value={formData.image || ""}
                    onChange={(e) => handleFormChange("image", e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    Seleccionar imagen
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-author">Autor</Label>
                <Input
                  id="edit-author"
                  placeholder="Nombre del autor"
                  value={formData.author || ""}
                  onChange={(e) => handleFormChange("author", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="edit-tags"
                  placeholder="huevos, orgánico, salud"
                  value={formData.tags ? formData.tags.join(", ") : ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Diálogo para ver contenido */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentContent?.title}</DialogTitle>
            <DialogDescription>{currentContent?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative h-48 w-full rounded-md overflow-hidden">
              <Image
                src={currentContent?.image || "/placeholder.svg"}
                alt={currentContent?.title || ""}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentContent?.type === "article"
                  ? "Artículo"
                  : currentContent?.type === "video"
                    ? "Video"
                    : "Infografía"}
              </Badge>
              <Badge variant={currentContent?.status === "published" ? "success" : "outline"}>
                {currentContent?.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Por {currentContent?.author} • {new Date(currentContent?.publishDate || "").toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Contenido:</h3>
              {currentContent?.type === "article" ? (
                <div className="p-4 border rounded-md bg-muted/50">
                  <p>{currentContent?.content}</p>
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-muted/50">
                  <p>URL: {currentContent?.content}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {currentContent?.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el contenido "{currentContent?.title}". Esta acción no se puede
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
