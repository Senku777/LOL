import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos de entradas de blog
let blogPosts: any[] = [
  {
    id: "1",
    title: "Beneficios de la agricultura sostenible",
    slug: "beneficios-agricultura-sostenible",
    excerpt: "Descubre cómo la agricultura sostenible beneficia al medio ambiente y a tu salud.",
    content:
      "La agricultura sostenible es un enfoque que busca equilibrar la producción de alimentos con la conservación del medio ambiente...",
    image: "/thriving-sustainable-farm.png",
    author: "María Rodríguez",
    category: "Sostenibilidad",
    tags: ["agricultura", "sostenibilidad", "medio ambiente"],
    publishedAt: "2023-03-15T10:00:00Z",
    featured: true,
  },
  {
    id: "2",
    title: "Cómo elegir los mejores huevos orgánicos",
    slug: "como-elegir-huevos-organicos",
    excerpt: "Guía completa para seleccionar los huevos orgánicos de mejor calidad.",
    content:
      "Al comprar huevos orgánicos, es importante verificar ciertos aspectos que garantizan su calidad y procedencia ética...",
    image: "/carton-of-jumbo-eggs.png",
    author: "Carlos Martínez",
    category: "Alimentación",
    tags: ["huevos", "orgánico", "alimentación"],
    publishedAt: "2023-04-10T14:30:00Z",
    featured: false,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar entrada de blog por ID
    const post = blogPosts.find((p) => p.id === id || p.slug === id)

    if (!post) {
      return NextResponse.json({ error: "Entrada de blog no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error al obtener entrada de blog:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Buscar entrada de blog por ID
    const postIndex = blogPosts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ error: "Entrada de blog no encontrada" }, { status: 404 })
    }

    // Actualizar slug si se cambia el título
    let slug = blogPosts[postIndex].slug
    if (body.title && body.title !== blogPosts[postIndex].title) {
      slug = body.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Actualizar entrada de blog
    blogPosts[postIndex] = {
      ...blogPosts[postIndex],
      ...body,
      slug,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      post: blogPosts[postIndex],
      message: "Entrada de blog actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar entrada de blog:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar entrada de blog por ID
    const postIndex = blogPosts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ error: "Entrada de blog no encontrada" }, { status: 404 })
    }

    // Eliminar entrada de blog
    const deletedPost = blogPosts[postIndex]
    blogPosts = blogPosts.filter((p) => p.id !== id)

    return NextResponse.json({
      message: "Entrada de blog eliminada exitosamente",
      post: deletedPost,
    })
  } catch (error) {
    console.error("Error al eliminar entrada de blog:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
