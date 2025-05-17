"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ShoppingBag, ArrowRight, Printer, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BackendService } from "@/lib/BackendService"
import { useAuth } from "@/contexts/auth-context"

export function OrderConfirmation() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchLastOrder = async () => {
      try {
        setLoading(true)
        
        if (!user?.id) {
          throw new Error('Usuario no autenticado')
        }

        const orders = await BackendService.getOrdersByUser(user.id)
        if (!orders || orders.length === 0) {
          throw new Error('No se encontraron órdenes')
        }

        const sortedOrders = [...orders].sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        setOrder(sortedOrders[0])
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la orden",
          variant: "destructive"
        })
        router.push('/carrrito')
      } finally {
        setLoading(false)
      }
    }

    fetchLastOrder()
  }, [toast, router, user])

  if (loading) {
    return (
      <div className="text-center py-6">
        <p>Cargando información de tu pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-6">
        <p>No se encontró información del pedido</p>
        <Button asChild className="mt-4">
          <Link href="/carrito">Volver al carrito</Link>
        </Button>
      </div>
    )
  }

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleResendEmail = () => {
    toast({
      title: "Email enviado",
      description: "Se ha enviado un correo electrónico con los detalles de tu pedido.",
    })
  }

  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">¡Gracias por tu compra!</h2>
      <p className="text-muted-foreground mb-6">Tu pedido #{order.id} ha sido recibido y está siendo procesado.</p>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Número de pedido</h3>
              <p className="font-bold text-lg">{order.id}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Fecha estimada de entrega</h3>
              <p className="font-bold">{estimatedDelivery.toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Dirección de envío</h3>
              <p>
                {order.shippingAddress?.fullName || 'N/A'}
                <br />
                {order.shippingAddress?.address || 'N/A'}
                <br />
                {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}
                <br />
                Tel: {order.shippingAddress?.phone || 'N/A'}
              </p>
              {order.shippingAddress?.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Notas:</span> {order.shippingAddress.notes}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Método de pago</h3>
              <p>
                {order.paymentDetails?.method === "credit-card"
                  ? `Tarjeta terminada en ${order.paymentDetails?.cardNumber?.slice(-4) || '****'}`
                  : order.paymentDetails?.method || 'N/A'}
              </p>
              <p className="mt-1 text-sm">
                Total: ${order.total?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="sm" onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir recibo
            </Button>
            <Button variant="outline" size="sm" onClick={handleResendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Reenviar confirmación
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mb-2">Hemos enviado un correo electrónico de confirmación a tu dirección de correo.</p>
      <p className="text-muted-foreground mb-8">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/perfil/pedidos">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver mis pedidos
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalogo">
            Seguir comprando
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}