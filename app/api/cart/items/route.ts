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
    const { productId, quantity } = await request.json()
    
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "ID de producto y cantidad son requeridos" },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "La cantidad debe ser mayor a 0" },
        { status: 400 }
      )
    }

    // 3. Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // 4. Transacción para actualizar el carrito
    const updatedCart = await prisma.$transaction(async (tx) => {
      // 4.1. Buscar o crear carrito
      let order = await tx.order.findFirst({
        where: {
          userId: user.id,
          status: "PENDING"
        },
        include: {
          items: true
        }
      })

      if (!order) {
        order = await tx.order.create({
          data: {
            userId: user.id,
            status: "PENDING",
            shippingAddress: {},
            paymentDetails: {},
            subtotal: 0,
            shippingCost: 0,
            total: 0,
            items: {
              create: []
            }
          },
          include: {
            items: true
          }
        })
      }

      // 4.2. Buscar si el producto ya está en el carrito
      const existingItem = order.items.find(item => item.productId === productId)

      // 4.3. Actualizar o crear item
      if (existingItem) {
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        })
      } else {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity,
            name: product.name,
            price: product.price
          }
        })
      }

      // 4.4. Recalcular totales
      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true }
      })

      const subtotal = items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)

      // Calcular costo de envío (gratis si el subtotal es mayor a 50)
      const shippingCost = subtotal > 50 ? 0 : 5.99;

      // 4.5. Actualizar orden (carrito)
      return await tx.order.update({
        where: { id: order.id },
        data: {
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

    return NextResponse.json({
      cart: updatedCart,
      message: "Producto agregado al carrito exitosamente"
    })
  } catch (error) {
    console.error("Error POST /api/cart/items:", error)
    return NextResponse.json(
      { error: "Error al agregar producto al carrito" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    // 2. Validar parámetros
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "ID de producto es requerido" },
        { status: 400 }
      )
    }

    // 3. Transacción para eliminar item
    let updatedCart = null;
    
    try {
      updatedCart = await prisma.$transaction(async (tx) => {
        // 3.1. Buscar carrito
        const order = await tx.order.findFirst({
          where: {
            userId: user.id,
            status: "PENDING"
          },
          include: {
            items: true
          }
        })

        if (!order) {
          return null; // Manejamos esto fuera de la transacción
        }

        // 3.2. Buscar item a eliminar
        const itemToRemove = order.items.find(item => item.productId === productId)
        if (!itemToRemove) {
          return order; // Devolvemos el carrito sin cambios
        }

        // 3.3. Eliminar item
        await tx.orderItem.delete({
          where: { id: itemToRemove.id }
        })

        // 3.4. Recalcular totales
        const remainingItems = await tx.orderItem.findMany({
          where: { orderId: order.id },
          include: { product: true }
        })

        // Si no quedan items, eliminamos el carrito
        if (remainingItems.length === 0) {
          await tx.order.delete({
            where: { id: order.id }
          });
          return null;
        }

        const subtotal = remainingItems.reduce((sum, item) => {
          return sum + (item.product.price * item.quantity)
        }, 0)

        // Calcular costo de envío (gratis si el subtotal es mayor a 50)
        const shippingCost = subtotal > 50 ? 0 : 5.99;

        // 3.5. Actualizar orden (carrito)
        return await tx.order.update({
          where: { id: order.id },
          data: {
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
      });
    } catch (error) {
      console.error("Error en la transacción:", error);
      throw error;
    }

    // Si el carrito fue eliminado (no quedan productos)
    if (!updatedCart) {
      return NextResponse.json({
        cart: null,
        message: "Producto eliminado y carrito vacío"
      });
    }

    return NextResponse.json({
      cart: updatedCart,
      message: "Producto eliminado del carrito exitosamente"
    })
  } catch (error) {
    console.error("Error DELETE /api/cart/items:", error)
    
    if (error instanceof Error) {
      if (error.message === "Carrito no encontrado") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      if (error.message === "Producto no encontrado en el carrito") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar producto del carrito" },
      { status: 500 }
    )
  }
}