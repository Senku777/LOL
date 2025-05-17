import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de proveedores
const suppliers: any[] = [
  {
    id: "1",
    name: "Granja Orgánica El Roble",
    contact: "Juan Pérez",
    email: "juan@elroble.com",
    phone: "555-123-4567",
    address: "Carretera Rural 45, Km 3",
    products: ["Huevos", "Pollo"],
    active: true,
  },
  {
    id: "2",
    name: "Avícola San Francisco",
    contact: "María Rodríguez",
    email: "maria@sanfrancisco.com",
    phone: "555-987-6543",
    address: "Calle Industrial 78",
    products: ["Pollo", "Pavo"],
    active: true,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar proveedor por ID
    const supplier = suppliers.find((s) => s.id === id)

    if (!supplier) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error("Error al obtener proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Buscar proveedor por ID
    const supplierIndex = suppliers.findIndex((s) => s.id === id)

    if (supplierIndex === -1) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    // Actualizar proveedor
    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      ...body,
    }

    return NextResponse.json({
      supplier: suppliers[supplierIndex],
      message: "Proveedor actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar proveedor por ID
    const supplierIndex = suppliers.findIndex((s) => s.id === id)

    if (supplierIndex === -1) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    // Eliminar proveedor (o marcar como inactivo)
    suppliers[supplierIndex].active = false

    return NextResponse.json({
      message: "Proveedor desactivado exitosamente",
      supplier: suppliers[supplierIndex],
    })
  } catch (error) {
    console.error("Error al desactivar proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
