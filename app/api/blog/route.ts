import { type NextRequest, NextResponse } from "next/server"
import { BackendService } from "@/lib/BackendService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    // Obtener todos los posts del blog
    let blogPosts = await BackendService.getAllBlogPosts()

    // Filtrar por categoría si se proporciona
    if (category) {
      blogPosts = blogPosts.filter((post) => post.category === category)
    }

    // Filtrar contenido destacado si se solicita
    if (featured === "true") {
      blogPosts = blogPosts.filter((post) => post.featured)
    }

    return NextResponse.json({ posts: blogPosts })
  } catch (error) {
    console.error("Error al obtener entradas de blog:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, excerpt, date, image, author } = body

    if (!title || !excerpt || !author) {
      return NextResponse.json({ error: "Todos los campos requeridos son necesarios" }, { status: 400 })
    }

    // Crear nueva entrada de blog
    const newPost = await BackendService.createBlogPost({
      title,
      excerpt,
      date: date || new Date().toISOString().split('T')[0],
      image: image || "/placeholder.svg",
      author,
    })

    return NextResponse.json(
      {
        post: newPost,
        message: "Entrada de blog creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear entrada de blog:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}