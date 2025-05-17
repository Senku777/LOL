import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.tour.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.supplier.deleteMany()

  console.log("Base de datos limpiada")

  // Crear usuarios
  const hashedPassword = await bcrypt.hash("password123", 10)

  const adminUser = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@example.com",
      password: hashedPassword,
      phone: "987654321",
      role: "ADMIN",
    },
  })

  const clientUser = await prisma.user.create({
    data: {
      name: "Usuario Normal",
      email: "user@example.com",
      password: hashedPassword,
      phone: "123456789",
      role: "CLIENTE",
    },
  })

  console.log("Usuarios creados")

  // Crear productos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Huevos Orgánicos",
        description: "Docena de huevos frescos de gallinas criadas en libertad",
        price: 5.99,
        category: "huevos",
        stock: 25,
        minStock: 10,
        image: "/carton-organic-eggs.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Pollo Entero",
        description: "Pollo entero criado sin antibióticos, listo para cocinar",
        price: 12.99,
        category: "carne",
        stock: 8,
        minStock: 5,
        image: "/roasted-whole-chicken.png",
      },
    }),
    prisma.product.create({
      data: {
        name: "Suscripción Huevos Semanal",
        description: "Recibe una docena de huevos orgánicos cada semana",
        price: 19.99,
        category: "suscripcion",
        stock: 999,
        minStock: 0,
        isSubscription: true,
        subscriptionFrequency: "weekly",
        image: "/carton-organic-eggs.png",
      },
    }),
  ])

  console.log("Productos creados")

  // Crear suscripción para el usuario cliente
  await prisma.subscription.create({
    data: {
      userId: clientUser.id,
      planId: "plan-mensual",
      planName: "Plan Mensual",
      status: "ACTIVE",
      startDate: new Date("2023-10-15"),
      nextBillingDate: new Date("2023-11-15"),
      price: 29.99,
      frequency: "monthly",
    },
  })

  console.log("Suscripción creada")

  // Crear tours
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        name: "Tour por las instalaciones de gallinas",
        description: "Visita a nuestras instalaciones donde criamos gallinas en libertad.",
        date: new Date("2023-12-15"),
        time: "10:00",
        duration: 60,
        maxParticipants: 20,
        currentParticipants: 12,
        guide: "María García",
        status: "SCHEDULED",
        category: "GALLINAS",
        price: 15,
      },
    }),
    prisma.tour.create({
      data: {
        name: "Proceso de recolección de huevos",
        description: "Conoce cómo recolectamos y procesamos los huevos orgánicos.",
        date: new Date("2023-12-20"),
        time: "16:00",
        duration: 45,
        maxParticipants: 15,
        currentParticipants: 15,
        guide: "Juan Pérez",
        status: "SCHEDULED",
        category: "HUEVOS",
        price: 12,
      },
    }),
  ])

  console.log("Tours creados")

  // Crear reserva para el usuario cliente
  await prisma.booking.create({
    data: {
      tourId: tours[0].id,
      userId: clientUser.id,
      status: "CONFIRMED",
      participants: 2,
      totalPrice: 30,
    },
  })

  console.log("Reserva creada")

  // Crear posts de blog
  await prisma.blogPost.create({
    data: {
      title: "Beneficios de los huevos orgánicos",
      slug: "beneficios-huevos-organicos",
      content: "Contenido completo del artículo sobre los beneficios de los huevos orgánicos...",
      excerpt:
        "Descubre por qué los huevos de gallinas criadas en libertad son mejores para tu salud y el medio ambiente.",
      author: "María García",
      category: "huevos",
      image: "/carton-organic-eggs.png",
      published: true,
    },
  })

  console.log("Posts de blog creados")

  // Crear proveedores
  await prisma.supplier.create({
    data: {
      name: "Piensos Naturales S.L.",
      contactName: "Juan Pérez",
      email: "juan@piensosnatural.es",
      phone: "612345678",
      address: "Calle Agricultura 23, Madrid",
      category: "feed",
      status: "active",
      notes: "Proveedor principal de piensos ecológicos",
    },
  })

  console.log("Proveedores creados")

  console.log("Datos iniciales creados correctamente")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
