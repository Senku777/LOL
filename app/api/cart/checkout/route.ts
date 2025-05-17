import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    // 2. Validar datos de entrada
    const { shippingAddress, paymentMethod } = await request.json()
    
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: "Dirección de envío y método de pago son requeridos" },
        { status: 400 }
      )
    }

    // 3. Transacción para procesar el checkout
    const order = await prisma.$transaction(async (tx) => {
      // 3.1. Obtener carrito (orden PENDING)
      const cart = await tx.order.findFirst({
        where: {
          userId: user.id,
          status: "PENDING"
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!cart) {
        throw new Error("Carrito no encontrado")
      }

      if (!cart.items || cart.items.length === 0) {
        throw new Error("El carrito está vacío")
      }

      // 3.2. Validar stock de productos
      const outOfStockItems = []
      for (const item of cart.items) {
        if (!item.product) {
          outOfStockItems.push({
            productId: item.productId,
            name: item.name,
            requested: item.quantity,
            available: 0,
            message: "Producto no encontrado"
          })
          continue
        }
        
        if (item.product.stock < item.quantity) {
          outOfStockItems.push({
            productId: item.productId,
            name: item.name,
            requested: item.quantity,
            available: item.product.stock,
            message: "Stock insuficiente"
          })
        }
      }

      if (outOfStockItems.length > 0) {
        throw {
          name: "OutOfStockError",
          items: outOfStockItems,
          message: "Algunos productos no tienen suficiente stock"
        }
      }

      // 3.3. Actualizar stock de productos
      for (const item of cart.items) {
        if (item.product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      // 3.4. Calcular total real
      const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)

      // Calcular costo de envío (gratis si el subtotal es mayor a 50)
      const shippingCost = subtotal > 50 ? 0 : 5.99;

      // 3.5. Convertir carrito en orden completada
      return await tx.order.update({
        where: { id: cart.id },
        data: {
          status: "PROCESSING", // Puedes usar "COMPLETED" si prefieres
          shippingAddress,
          paymentDetails: {
            method: paymentMethod,
            status: "pending", // Estado inicial del pago
            cardNumber: paymentMethod === "credit-card" ? shippingAddress.cardNumber || null : null,
            cardHolder: paymentMethod === "credit-card" ? shippingAddress.cardHolder || null : null
          },
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          updatedAt: new Date()
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json(
      {
        order,
        message: "Orden procesada exitosamente",
        redirectUrl: "/confirmacion-pedido" // Añadido para indicar redirección
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error en POST /api/cart/checkout:", error)
    
    // Manejo de errores personalizados
    if (error.name === "OutOfStockError") {
      return NextResponse.json(
        {
          error: error.message,
          outOfStockItems: error.items
        },
        { status: 400 }
      )
    }

    if (error.message === "Carrito no encontrado" || error.message === "El carrito está vacío") {
      return NextResponse.json(
        { 
          error: error.message,
          redirectUrl: "/carrito" // Redirección al carrito si está vacío
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Error al procesar el checkout",
        redirectUrl: "/carrito" // Redirección por defecto en caso de error
      },
      { status: 500 }
    )
  }
}