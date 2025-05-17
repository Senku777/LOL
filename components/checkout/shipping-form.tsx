"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCheckout } from "@/contexts/checkout-context"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function ShippingForm() {
  const { user } = useAuth()
  const { setShippingAddress, setStep } = useCheckout()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.nombre || "",
    address: "",
    city: "",
    postalCode: "",
    phone: user?.telefono || "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre es obligatorio"
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "El nombre debe tener al menos 3 caracteres"
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Por favor ingresa una dirección válida"
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ciudad es obligatoria"
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "El código postal es obligatorio"
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "El código postal debe tener 5 dígitos"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio"
    } else if (!/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = "El teléfono debe tener 9 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulación de procesamiento
    setTimeout(() => {
      setShippingAddress(formData)
      setStep("payment")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Información de Envío</h2>
        <p className="text-muted-foreground mb-6">Por favor, introduce los datos de envío para tu pedido</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={errors.fullName ? "border-red-500" : ""}
            placeholder="Ej. Juan Pérez"
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? "border-red-500" : ""}
            placeholder="Ej. 612345678"
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Dirección <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={errors.address ? "border-red-500" : ""}
          placeholder="Ej. Calle Principal 123"
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            Ciudad <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? "border-red-500" : ""}
            placeholder="Ej. Madrid"
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Código Postal <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className={errors.postalCode ? "border-red-500" : ""}
            placeholder="Ej. 28001"
          />
          {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas de entrega (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Instrucciones especiales para la entrega"
          rows={3}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Continuar al Pago"
          )}
        </Button>
      </div>
    </form>
  )
}
