"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, Users, Calendar } from "lucide-react"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

// Tipos para los tours disponibles
type TourStatus = "scheduled" | "completed" | "cancelled"
type TourCategory = "gallinas" | "huevos" | "sostenibilidad" | "general"

type Tour = {
  id: number
  name: string
  description: string
  date: string
  time: string
  duration: number
  maxParticipants: number
  currentParticipants: number
  guide: string
  status: TourStatus
  category: TourCategory
  price: number
}

export default function ToursDisponiblesPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Cargar tours desde la API
  useEffect(() => {
    async function fetchTours() {
      try {
        setIsLoading(true)
        let url = '/api/tours-disponibles'
        
        // Añadir parámetros de filtro si existen
        const params = new URLSearchParams()
        if (selectedDate && selectedDate !== 'all') {
          params.append('date', selectedDate)
        }
        if (categoryFilter && categoryFilter !== 'all') {
          params.append('category', categoryFilter)
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.tours) {
          setFilteredTours(data.tours)
        } else {
          setFilteredTours([])
          console.error("Formato de respuesta inesperado:", data)
        }
      } catch (error) {
        console.error("Error al cargar tours:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tours disponibles",
          variant: "destructive",
        })
        setFilteredTours([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [selectedDate, categoryFilter, toast])

  const handleReserve = (tour: Tour) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas iniciar sesión para reservar un tour",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/tours-disponibles`)
      return
    }

    // Verificar si hay espacio disponible
    if (tour.currentParticipants >= tour.maxParticipants) {
      toast({
        title: "Tour completo",
        description: "Lo sentimos, este tour ya ha alcanzado el máximo de participantes",
        variant: "destructive",
      })
      return
    }

    setSelectedTour(tour)

    // Pre-llenar con datos del usuario si está autenticado
    if (isAuthenticated && user) {
      setParticipantName(user.nombre || "")
      setParticipantEmail(user.email || "")
    }

    setIsDialogOpen(true)
  }

  const handleSubmitReservation = async () => {
    if (!participantName || !participantEmail) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (!selectedTour) return;

    try {
      const response = await fetch('/api/tours-disponibles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: selectedTour.id,
          userId: user?.id,
          participantName,
          participantEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Reserva exitosa!",
          description: `Has reservado correctamente el tour "${selectedTour?.name}"`,
        });

        // Actualizar la lista de tours para reflejar el cambio en participantes
        setFilteredTours(prevTours => 
          prevTours.map(tour => 
            tour.id === selectedTour.id 
              ? { ...tour, currentParticipants: tour.currentParticipants + 1 } 
              : tour
          )
        );
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo completar la reserva",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu reserva",
        variant: "destructive",
      });
    }

    setIsDialogOpen(false)
    setParticipantName("")
    setParticipantEmail("")
    setSelectedTour(null)
  }

  // Generar fechas para los próximos 30 días
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i)
      const formattedDate = format(date, "yyyy-MM-dd")
      const displayDate = format(date, "dd 'de' MMMM", { locale: es })
      dates.push({ value: formattedDate, label: displayDate })
    }

    return dates
  }

  const dateOptions = generateDateOptions()

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Tours Disponibles</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra granja con visitas guiadas. Selecciona un día y categoría para ver los tours disponibles.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Label htmlFor="date-filter" className="mb-2 block">
            Fecha del tour
          </Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter" className="w-full">
              <SelectValue placeholder="Selecciona una fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              {dateOptions.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  {date.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="category-filter" className="mb-2 block">
            Categoría
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category-filter" className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="gallinas">Gallinas</SelectItem>
              <SelectItem value="huevos">Huevos</SelectItem>
              <SelectItem value="sostenibilidad">Sostenibilidad</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <div className="animate-spin h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Cargando tours disponibles</h2>
          <p className="text-muted-foreground">Por favor espera mientras obtenemos la información...</p>
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay tours disponibles con estos filtros</h2>
          <p className="text-muted-foreground">Prueba con otra fecha o categoría para encontrar tours disponibles.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const tourDate = new Date(tour.date)
            const isFull = tour.currentParticipants >= tour.maxParticipants
            const categoryColors: Record<TourCategory, string> = {
              gallinas: "bg-amber-100 text-amber-800",
              huevos: "bg-blue-100 text-blue-800",
              sostenibilidad: "bg-green-100 text-green-800",
              general: "bg-purple-100 text-purple-800",
            }

            return (
              <Card key={tour.id} className={isFull ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="mr-2">{tour.name}</CardTitle>
                    <Badge className={categoryColors[tour.category]}>
                      {tour.category.charAt(0).toUpperCase() + tour.category.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{tour.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{format(tourDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {tour.time} ({tour.duration} minutos)
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {tour.currentParticipants}/{tour.maxParticipants} participantes
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <span>Precio: ${tour.price}</span>
                    </div>
                  </div>
                  <div>
                    <Badge variant={isFull ? "outline" : "default"}>{isFull ? "Completo" : "Disponible"}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={isFull} onClick={() => handleReserve(tour)}>
                    {isFull ? "Tour Completo" : "Reservar"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reserva de Tour</DialogTitle>
            <DialogDescription>Completa tus datos para reservar el tour "{selectedTour?.name}"</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            {selectedTour && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Precio del tour:</span>
                  <span className="font-medium">${selectedTour.price}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Recibirás un correo electrónico con los detalles de tu reserva y las instrucciones para el pago.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReservation}>Confirmar reserva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}