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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    let filteredSuppliers = [...suppliers]

    // Filtrar proveedores activos si se solicita
    if (active === "true") {
      filteredSuppliers = filteredSuppliers.filter((s) => s.active)
    }

    return NextResponse.json({ suppliers: filteredSuppliers })
  } catch (error) {
    console.error("Error al obtener proveedores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, contact, email, phone, address, products } = body

    if (!name || !contact || !email || !phone || !address || !products) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Crear nuevo proveedor
    const newSupplier = {
      id: `${suppliers.length + 1}`,
      name,
      contact,
      email,
      phone,
      address,
      products,
      active: true,
    }

    suppliers.push(newSupplier)

    return NextResponse.json(
      {
        supplier: newSupplier,
        message: "Proveedor creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
