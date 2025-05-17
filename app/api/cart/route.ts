import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { BackendService } from "@/lib/BackendService"

export async function GET(request: NextRequest) {
  try {
    // Obtener el ID del usuario desde la cookie de sesión (si está autenticado)
    const cookieStore = cookies()
    const sessionCookie = await cookieStore.get("__session")
    console.log(sessionCookie)
    let userId = null

    if (sessionCookie) {
      try {
        // Verificar que el valor de la cookie sea válido antes de decodificarlo
        if (sessionCookie.value) {
          try {
            // Intentar decodificar directamente sin atob primero
            const sessionData = JSON.parse(sessionCookie.value)
            userId = sessionData.userId
          } catch (parseError) {
            // Si falla, intentar con decodificación base64
            try {
              const decodedValue = decodeURIComponent(escape(atob(sessionCookie.value)))
              const sessionData = JSON.parse(decodedValue)
              userId = sessionData.userId
            } catch (decodeError) {
              console.error("Error al decodificar la cookie de sesión:", decodeError)
            }
          }
        }
      } catch (error) {
        console.error("Error al procesar la cookie de sesión:", error)
      }
    }

    // Obtener los items del carrito desde la base de datos
    let cartItems = []
    let subtotal = 0
    let shippingCost = 0
    
    if (userId) {
      // Si el usuario está autenticado, obtener su carrito desde la base de datos
      const userCart = await BackendService.getCartByUserId(userId)
      
      if (userCart && userCart.items) {
        cartItems = await Promise.all(
          userCart.items.map(async (item) => {
            const product = await BackendService.getProductById(item.productId)
            return {
              id: item.productId,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: product.image || "/placeholder.svg",
              stock: product.stock,
              isSubscription: product.isSubscription || false,
              subscriptionFrequency: product.subscriptionFrequency || null,
            }
          })
        )
        
        // Calcular subtotal
        subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    } else {
      // Si no hay usuario autenticado, obtener el carrito de la cookie
      const cartCookie = await cookieStore.get("carrito")
      
      if (cartCookie) {
        try {
          const cartData = JSON.parse(cartCookie.value)
          
          if (Array.isArray(cartData)) {
            cartItems = await Promise.all(
              cartData.map(async (item) => {
                const product = await BackendService.getProductById(item.id)
                return {
                  id: item.id,
                  name: product ? product.name : item.name,
                  price: product ? product.price : item.price,
                  quantity: item.quantity,
                  image: product ? (product.image || "/placeholder.svg") : (item.image || "/placeholder.svg"),
                  stock: product ? product.stock : item.stock || 0,
                  isSubscription: product ? (product.isSubscription || false) : (item.isSubscription || false),
                  subscriptionFrequency: product ? product.subscriptionFrequency : item.subscriptionFrequency,
                }
              })
            )
            
            // Calcular subtotal
            subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          }
        } catch (error) {
          console.error("Error al decodificar la cookie del carrito:", error)
        }
      }
    }
    
    // Calcular costo de envío (gratis si el subtotal es mayor a 50)
    shippingCost = subtotal > 50 ? 0 : 5.99
    
    // Calcular total
    const total = subtotal + shippingCost
    
    // Devolver los datos del carrito
    return NextResponse.json({
      items: cartItems,
      subtotal,
      shippingCost,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    })
  } catch (error) {
    console.error("Error al obtener los datos del carrito:", error)
    return NextResponse.json(
      { error: "Error al obtener los datos del carrito" },
      { status: 500 }
    )
  }
}

// Implementar método POST para actualizar el carrito
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { items, userId } = data
    
    // Si hay un userId, actualizar el carrito en la base de datos
    if (userId) {
      await BackendService.updateUserCart(userId, items)
    }
    
    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Calcular costo de envío (gratis si el subtotal es mayor a 50)
    const shippingCost = subtotal > 50 ? 0 : 5.99
    
    // Calcular total
    const total = subtotal + shippingCost
    
    // Actualizar la cookie del carrito
    const cookieStore = cookies()
    await cookieStore.set("cart", JSON.stringify(items), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    
    return NextResponse.json({
      success: true,
      items,
      subtotal,
      shippingCost,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    })
  } catch (error) {
    console.error("Error al actualizar el carrito:", error)
    return NextResponse.json(
      { error: "Error al actualizar el carrito" },
      { status: 500 }
    )
  }
}