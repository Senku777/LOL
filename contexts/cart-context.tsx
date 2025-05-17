"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  stock: number
  isSubscription?: boolean
  subscriptionFrequency?: "weekly" | "monthly"
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (id: number, quantity: number) => void
  removeItem: (id: number) => void
  clearCart: () => void
  subtotal: number
  shippingCost: number
  total: number
  itemCount: number
  validateStock: () => { valid: boolean; invalidItems: CartItem[] }
  isLoading: boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  subtotal: 0,
  shippingCost: 0,
  total: 0,
  itemCount: 0,
  validateStock: () => ({ valid: true, invalidItems: [] }),
  isLoading: false
})

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Función para cargar el carrito desde la API
  const fetchCart = async () => {
    try {
      setIsLoading(true)
      // Intentar cargar desde la API
      const response = await fetch('/api/cart')
      
      if (response.ok) {
        const data = await response.json()
        if (data.items) {
          setItems(data.items)
        }
      } else {
        // Si falla la API, intentar cargar desde localStorage como respaldo
        const savedCart = localStorage.getItem("brotato-cart")
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart))
          } catch (error) {
            console.error("Error al analizar el carrito desde localStorage:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error)
      // Intentar cargar desde localStorage como respaldo
      const savedCart = localStorage.getItem("brotato-cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error al analizar el carrito desde localStorage:", error)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para sincronizar el carrito con el backend
  const syncCartWithBackend = async (updatedItems: CartItem[]) => {
    try {
      // Guardar en localStorage como respaldo
      localStorage.setItem("brotato-cart", JSON.stringify(updatedItems))
      
      // Sincronizar con el backend
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedItems }),
      })
    } catch (error) {
      console.error("Error al sincronizar el carrito con el backend:", error)
    }
  }

  // Cargar carrito al iniciar
  useEffect(() => {
    fetchCart()
  }, [])

  // Función para validar el stock de todos los productos en el carrito
  const validateStock = () => {
    const invalidItems: CartItem[] = []

    // Verificar cada item en el carrito
    items.forEach((item) => {
      if (item.quantity > item.stock) {
        invalidItems.push(item)
      }
    })

    return {
      valid: invalidItems.length === 0,
      invalidItems,
    }
  }

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

      let updatedItems: CartItem[] = []

      if (existingItemIndex >= 0) {
        // Si ya existe, actualizar la cantidad
        updatedItems = [...prevItems]
        const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity

        // Verificar stock disponible
        if (newQuantity > item.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${item.stock} unidades disponibles de este producto.`,
            variant: "destructive",
          })
          updatedItems[existingItemIndex].quantity = item.stock
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity
          toast({
            title: "Producto actualizado",
            description: `${item.name} actualizado en el carrito.`,
          })
        }
      } else {
        // Si no existe, añadirlo al carrito
        updatedItems = [...prevItems, item]
        toast({
          title: "Producto añadido",
          description: `${item.name} añadido al carrito.`,
        })
      }

      // Sincronizar con el backend
      syncCartWithBackend(updatedItems)
      
      return updatedItems
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto
      removeItem(id)
      return
    }

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === id) {
          // Verificar stock disponible
          if (quantity > item.stock) {
            toast({
              title: "Stock insuficiente",
              description: `Solo hay ${item.stock} unidades disponibles de este producto.`,
              variant: "destructive",
            })
            return { ...item, quantity: item.stock }
          }
          return { ...item, quantity }
        }
        return item
      })

      // Sincronizar con el backend
      syncCartWithBackend(updatedItems)
      
      return updatedItems
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        toast({
          title: "Producto eliminado",
          description: `${itemToRemove.name} eliminado del carrito.`,
        })
      }
      
      const updatedItems = prevItems.filter((item) => item.id !== id)
      
      // Sincronizar con el backend
      syncCartWithBackend(updatedItems)
      
      return updatedItems
    })
  }

  const clearCart = () => {
    setItems([])
    
    // Sincronizar con el backend
    syncCartWithBackend([])
    
    toast({
      title: "Carrito vacío",
      description: "Todos los productos han sido eliminados del carrito.",
    })
  }

  // Calcular subtotal
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calcular costo de envío (gratis si el subtotal es >= $50)
  const shippingCost = subtotal >= 50 ? 0 : 5.99

  // Calcular total
  const total = subtotal + shippingCost

  // Calcular número total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        shippingCost,
        total,
        itemCount,
        validateStock,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  )
}