import { type NextRequest, NextResponse } from "next/server";
import { BackendService } from "@/lib/BackendService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    // Obtener todos los productos usando BackendService
    let products = await BackendService.getAllProducts();

    // Filtrar por categoría si se proporciona
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // Filtrar productos destacados (asumiendo que has añadido un campo featured a tu modelo Product)
    if (featured === "true") {
      products = products.filter((p) => p.featured);
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      image, 
      category, 
      stock, 
      featured,
      oldPrice,
      minStock,
      isSubscription,
      subscriptionFrequency
    } = body;

    // Validación de campos requeridos
    if (!name || !description || !price || !category || stock === undefined) {
      return NextResponse.json(
        { error: "Nombre, descripción, precio, categoría y stock son campos requeridos" },
        { status: 400 }
      );
    }

    // Crear nuevo producto usando BackendService
    const newProduct = await BackendService.createProduct({
      name,
      description,
      price,
      oldPrice: oldPrice || null,
      category,
      stock,
      minStock: minStock || 0,
      image: image || null,
      featured: featured,
      isSubscription: isSubscription || false,
      subscriptionFrequency: subscriptionFrequency || null
    });

    return NextResponse.json(
      {
        product: newProduct,
        message: "Producto creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      name, 
      description, 
      price, 
      image, 
      category, 
      stock, 
      featured,
      oldPrice,
      minStock,
      isSubscription,
      subscriptionFrequency
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto es requerido" },
        { status: 400 }
      );
    }

    // Actualizar producto usando BackendService
    const updatedProduct = await BackendService.updateProduct(id, {
      name,
      description,
      price,
      oldPrice,
      category,
      stock,
      minStock,
      image,
      featured,
      isSubscription,
      subscriptionFrequency
    });

    return NextResponse.json(
      {
        product: updatedProduct,
        message: "Producto actualizado exitosamente",
      }
    );
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del producto es requerido" },
        { status: 400 }
      );
    }

    // Eliminar producto usando BackendService
    await BackendService.deleteProduct(id);

    return NextResponse.json(
      { message: "Producto eliminado exitosamente" }
    );
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}