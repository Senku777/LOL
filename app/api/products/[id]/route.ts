import { type NextRequest, NextResponse } from "next/server"
import { BackendService } from "@/lib/BackendService"
import { Prisma } from "@prisma/client"

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto es requerido" },
        { status: 400 }
      )
    }

    // Obtener producto por ID usando BackendService
    const product = await BackendService.getProductById(id)

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error GET /api/products/[id]:", error)
    
    return NextResponse.json(
      { 
        error: "Error al obtener producto",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto es requerido" },
        { status: 400 }
      )
    }

    // Validar campos mínimos
    if (!body.name || !body.description || !body.price || !body.category) {
      return NextResponse.json(
        { error: "Nombre, descripción, precio y categoría son requeridos" },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: Prisma.ProductUpdateInput = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      oldPrice: body.oldPrice !== undefined ? Number(body.oldPrice) : undefined,
      category: body.category,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      minStock: body.minStock !== undefined ? Number(body.minStock) : undefined,
      image: body.image,
      featured: body.featured,
      isSubscription: body.isSubscription,
      subscriptionFrequency: body.subscriptionFrequency
    }

    // Actualizar producto usando BackendService
    const updatedProduct = await BackendService.updateProduct(id, updateData)

    return NextResponse.json({
      product: updatedProduct,
      message: "Producto actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error PUT /api/products/[id]:", error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: "Error de base de datos",
          code: error.code,
          meta: error.meta
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Error al actualizar producto",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto es requerido" },
        { status: 400 }
      )
    }

    // Verificar si el producto existe primero
    const existingProduct = await BackendService.getProductById(id)
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar producto usando BackendService
    await BackendService.deleteProduct(id)

    return NextResponse.json({
      message: "Producto eliminado exitosamente",
      product: existingProduct,
    })
  } catch (error) {
    console.error("Error DELETE /api/products/[id]:", error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: "Error de base de datos",
          code: error.code,
          meta: error.meta
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Error al eliminar producto",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}