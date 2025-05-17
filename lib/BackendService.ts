import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

// Tipos para las entradas
type UserInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'ADMIN' | 'EMPLEADO' | 'CLIENTE';
};

type ProductInput = {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  stock: number;
  minStock: number;
  isSubscription?: boolean;
  subscriptionFrequency?: string;
  image?: string;
  featured?: null
};

type OrderInput = {
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  shippingAddress: any;
  paymentDetails: any;
  subtotal: number;
  shippingCost: number;
  total: number;
};

type OrderItemInput = {
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type SubscriptionInput = {
  userId: string;
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  startDate: Date;
  nextBillingDate: Date;
  price: number;
  frequency: string;
};

type TourInput = {
  name: string;
  description: string;
  date: Date;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants?: number;
  guide: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  category: 'GALLINAS' | 'HUEVOS' | 'SOSTENIBILIDAD' | 'GENERAL';
  price: number;
};

type BookingInput = {
  tourId: number;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  participants?: number;
  totalPrice: number;
};

type ReviewInput = {
  userId: string;
  tourId: number;
  rating: number;
  comment?: string;
};

type BlogPostInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  image?: string;
  published?: boolean;
};

type SupplierInput = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: string;
  notes?: string;
};

// Tipos para los tours disponibles
export type TourStatus = "scheduled" | "completed" | "cancelled";
export type TourCategory = "gallinas" | "huevos" | "sostenibilidad" | "general";

export type Tour = {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  guide: string;
  status: TourStatus;
  category: TourCategory;
  price: number;
};

export type TourReservation = {
  id: number;
  tourId: number;
  userId: string;
  participantName: string;
  participantEmail: string;
  reservationDate: string;
  status: "confirmed" | "cancelled" | "pending";
};

export const BackendService = {
  // Operaciones para User
  async getAllUsers() {
    return await prisma.user.findMany();
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async createUser(data: UserInput) {
    return await prisma.user.create({
      data,
    });
  },

  async updateUser(id: string, data: Partial<UserInput>) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Operaciones para Product
  async getAllProducts() {
    return await prisma.product.findMany();
  },

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  },

  async getProductsByCategory(category: string) {
    return await prisma.product.findMany({
      where: { category },
    });
  },

  async getSubscriptionProducts() {
    return await prisma.product.findMany({
      where: { isSubscription: true },
    });
  },

  async createProduct(data: ProductInput) {
    return await prisma.product.create({
      data,
    });
  },

  async updateProduct(id: string, data: Partial<ProductInput>) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  },

  // Operaciones para Order
  async getAllOrders() {
    return await prisma.order.findMany({
      include: { items: true, user: true },
    });
  },

  async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });
  },

  async getOrdersByUser(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
  },

  async getOrdersByStatus(status: any) {
    return await prisma.order.findMany({
      where: { status },
      include: { items: true, user: true },
    });
  },

  async createOrder(data: OrderInput) {
    return await prisma.order.create({
      data,
    });
  },

  async updateOrder(id: string, data: Partial<OrderInput>) {
    return await prisma.order.update({
      where: { id },
      data,
    });
  },

  async deleteOrder(id: string) {
    return await prisma.order.delete({
      where: { id },
    });
  },

  // Operaciones para OrderItem
  async addItemToOrder(data: OrderItemInput) {
    return await prisma.orderItem.create({
      data,
    });
  },

  async getOrderItems(orderId: string) {
    return await prisma.orderItem.findMany({
      where: { orderId },
      include: { product: true },
    });
  },

  async updateOrderItem(id: string, data: Partial<OrderItemInput>) {
    return await prisma.orderItem.update({
      where: { id },
      data,
    });
  },

  async removeOrderItem(id: string) {
    return await prisma.orderItem.delete({
      where: { id },
    });
  },

  // Operaciones para el Carrito (usando Order con status PENDING)
  async getCartByUserId(userId: string) {
    try {
      // Buscar una orden en estado PENDING para este usuario
      const pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        },
        include: { 
          items: {
            include: {
              product: true
            }
          } 
        },
      });
      
      if (!pendingOrder) return null;
      
      // Transformar los datos al formato esperado por el frontend
      const cartItems = pendingOrder.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product?.image || "/placeholder.svg",
        stock: item.product?.stock || 0,
        isSubscription: item.product?.isSubscription || false,
        subscriptionFrequency: item.product?.subscriptionFrequency || null,
      }));
      
      return {
        id: pendingOrder.id,
        items: cartItems,
        subtotal: pendingOrder.subtotal,
        shippingCost: pendingOrder.shippingCost,
        total: pendingOrder.total
      };
    } catch (error) {
      console.error("Error al obtener el carrito del usuario:", error);
      return null;
    }
  },

  async updateUserCart(userId: string, items: any[]) {
    try {
      // Calcular subtotal
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calcular costo de envío (gratis si el subtotal es mayor a 50)
      const shippingCost = subtotal > 50 ? 0 : 5.99;
      
      // Calcular total
      const total = subtotal + shippingCost;
      
      // Buscar si ya existe una orden pendiente para este usuario
      let pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        }
      });
      
      // Si no existe, crear una nueva
      if (!pendingOrder) {
        pendingOrder = await prisma.order.create({
          data: {
            userId,
            status: 'PENDING',
            shippingAddress: {},
            paymentDetails: {},
            subtotal,
            shippingCost,
            total
          }
        });
      } else {
        // Actualizar los totales
        await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            subtotal,
            shippingCost,
            total,
            updatedAt: new Date()
          }
        });
      }
      
      // Eliminar todos los items actuales
      await prisma.orderItem.deleteMany({
        where: { orderId: pendingOrder.id }
      });
      
      // Añadir los nuevos items
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.id.toString() }
        });
        
        if (product) {
          await prisma.orderItem.create({
            data: {
              orderId: pendingOrder.id,
              productId: item.id.toString(),
              name: product.name,
              price: product.price,
              quantity: item.quantity
            }
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error al actualizar el carrito del usuario:", error);
      return false;
    }
  },

  async clearUserCart(userId: string) {
    try {
      // Buscar si existe una orden pendiente para este usuario
      const pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        }
      });
      
      if (!pendingOrder) return true;
      
      // Eliminar todos los items
      await prisma.orderItem.deleteMany({
        where: { orderId: pendingOrder.id }
      });
      
      // Eliminar la orden
      await prisma.order.delete({
        where: { id: pendingOrder.id }
      });
      
      return true;
    } catch (error) {
      console.error("Error al limpiar el carrito del usuario:", error);
      return false;
    }
  },

  async addItemToCart(userId: string, productId: string, quantity: number) {
    try {
      // Obtener el producto
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) throw new Error("Producto no encontrado");
      
      // Buscar si ya existe una orden pendiente para este usuario
      let pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        },
        include: { items: true }
      });
      
      // Si no existe, crear una nueva
      if (!pendingOrder) {
        pendingOrder = await prisma.order.create({
          data: {
            userId,
            status: 'PENDING',
            shippingAddress: {},
            paymentDetails: {},
            subtotal: product.price * quantity,
            shippingCost: (product.price * quantity) > 50 ? 0 : 5.99,
            total: (product.price * quantity) + ((product.price * quantity) > 50 ? 0 : 5.99)
          },
          include: { items: true }
        });
      }
      
      // Verificar si el producto ya está en el carrito
      const existingItem = pendingOrder.items.find(item => item.productId === productId);
      
      if (existingItem) {
        // Actualizar la cantidad
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // Añadir el nuevo item
        await prisma.orderItem.create({
          data: {
            orderId: pendingOrder.id,
            productId,
            name: product.name,
            price: product.price,
            quantity
          }
        });
      }
      
      // Recalcular totales
      const updatedOrder = await prisma.order.findUnique({
        where: { id: pendingOrder.id },
        include: { items: true }
      });
      
      if (updatedOrder) {
        const subtotal = updatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shippingCost;
        
        await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            subtotal,
            shippingCost,
            total
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error al añadir item al carrito:", error);
      return false;
    }
  },

  async removeItemFromCart(userId: string, productId: string) {
    try {
      // Buscar si existe una orden pendiente para este usuario
      const pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        },
        include: { items: true }
      });
      
      if (!pendingOrder) return false;
      
      // Buscar el item
      const item = pendingOrder.items.find(item => item.productId === productId);
      
      if (!item) return false;
      
      // Eliminar el item
      await prisma.orderItem.delete({
        where: { id: item.id }
      });
      
      // Recalcular totales
      const updatedOrder = await prisma.order.findUnique({
        where: { id: pendingOrder.id },
        include: { items: true }
      });
      
      if (updatedOrder && updatedOrder.items.length > 0) {
        const subtotal = updatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shippingCost;
        
        await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            subtotal,
            shippingCost,
            total
          }
        });
      } else if (updatedOrder && updatedOrder.items.length === 0) {
        // Si no quedan items, eliminar la orden
        await prisma.order.delete({
          where: { id: pendingOrder.id }
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error al eliminar item del carrito:", error);
      return false;
    }
  },

  async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        return this.removeItemFromCart(userId, productId);
      }
      
      // Buscar si existe una orden pendiente para este usuario
      const pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        },
        include: { items: true }
      });
      
      if (!pendingOrder) return false;
      
      // Buscar el item
      const item = pendingOrder.items.find(item => item.productId === productId);
      
      if (!item) return false;
      
      // Actualizar la cantidad
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { quantity }
      });
      
      // Recalcular totales
      const updatedOrder = await prisma.order.findUnique({
        where: { id: pendingOrder.id },
        include: { items: true }
      });
      
      if (updatedOrder) {
        const subtotal = updatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + shippingCost;
        
        await prisma.order.update({
          where: { id: pendingOrder.id },
          data: {
            subtotal,
            shippingCost,
            total
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error al actualizar cantidad del item:", error);
      return false;
    }
  },

  async convertCartToOrder(userId: string, shippingAddress: any, paymentDetails: any) {
    try {
      // Buscar si existe una orden pendiente para este usuario
      const pendingOrder = await prisma.order.findFirst({
        where: { 
          userId,
          status: 'PENDING' 
        }
      });
      
      if (!pendingOrder) return null;
      
      // Actualizar la orden a PROCESSING
      const updatedOrder = await prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          status: 'PROCESSING',
          shippingAddress,
          paymentDetails
        },
        include: { items: true, user: true }
      });
      
      return updatedOrder;
    } catch (error) {
      console.error("Error al convertir carrito a orden:", error);
      return null;
    }
  },

  // Operaciones para Subscription
  async getAllSubscriptions() {
    return await prisma.subscription.findMany({
      include: { user: true },
    });
  },

  async getSubscriptionById(id: string) {
    return await prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  async getSubscriptionByUser(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: { user: true },
    });
  },

  async getSubscriptionsByStatus(status: any) {
    return await prisma.subscription.findMany({
      where: { status },
      include: { user: true },
    });
  },

  async createSubscription(data: SubscriptionInput) {
    return await prisma.subscription.create({
      data,
    });
  },

  async updateSubscription(id: string, data: Partial<SubscriptionInput>) {
    return await prisma.subscription.update({
      where: { id },
      data,
    });
  },

  async deleteSubscription(id: string) {
    return await prisma.subscription.delete({
      where: { id },
    });
  },

  // Operaciones para Tour
  async getAllTours() {
    return await prisma.tour.findMany();
  },

  async getToursByCategory(category: any) {
    return await prisma.tour.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
    });
  },

  async getToursByDate(date: string) {
    return await prisma.tour.findMany({
      where: { date: new Date(date) },
    });
  },

  async getToursByStatus(status: any) {
    return await prisma.tour.findMany({
      where: { status },
    });
  },

  async getUpcomingTours() {
    return await prisma.tour.findMany({
      where: {
        date: { gte: new Date() },
        status: 'SCHEDULED',
      },
    });
  },

  async getTourById(id: number) {
    return await prisma.tour.findUnique({
      where: { id },
    });
  },

  async createTour(data: TourInput) {
    return await prisma.tour.create({
      data,
    });
  },

  async updateTour(id: number, data: Partial<TourInput>) {
    return await prisma.tour.update({
      where: { id },
      data,
    });
  },

  async deleteTour(id: number) {
    return await prisma.tour.delete({
      where: { id },
    });
  },

  async createTourReservation(reservation: Omit<TourReservation, 'id' | 'reservationDate' | 'status'>) {
    // Crear una nueva reserva en la base de datos
    const booking = await prisma.booking.create({
      data: {
        tourId: reservation.tourId,
        userId: reservation.userId,
        status: 'CONFIRMED',
        participants: 1,
        totalPrice: 0, // Se debe calcular basado en el precio del tour
        participantName: reservation.participantName,
        participantEmail: reservation.participantEmail,
      },
    });

    // Actualizar el número de participantes del tour
    const tour = await prisma.tour.findUnique({
      where: { id: reservation.tourId },
    });

    if (tour) {
      await prisma.tour.update({
        where: { id: reservation.tourId },
        data: {
          currentParticipants: (tour.currentParticipants || 0) + 1,
        },
      });
    }

    return {
      id: booking.id,
      tourId: booking.tourId,
      userId: booking.userId,
      participantName: booking.participantName || '',
      participantEmail: booking.participantEmail || '',
      reservationDate: booking.createdAt.toISOString(),
      status: booking.status.toLowerCase(),
    };
  },

  // Operaciones para Booking
  async getAllBookings() {
    return await prisma.booking.findMany({
      include: { tour: true, user: true },
    });
  },

  async getBookingById(id: string) {
    return await prisma.booking.findUnique({
      where: { id },
      include: { tour: true, user: true },
    });
  },

  async getBookingsByUser(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      include: { tour: true },
    });
  },

  async getBookingsByTour(tourId: number) {
    return await prisma.booking.findMany({
      where: { tourId },
      include: { user: true },
    });
  },

  async getBookingsByStatus(status: any) {
    return await prisma.booking.findMany({
      where: { status },
      include: { tour: true, user: true },
    });
  },

  async createBooking(data: BookingInput) {
    return await prisma.booking.create({
      data,
    });
  },

  async updateBooking(id: string, data: Partial<BookingInput>) {
    return await prisma.booking.update({
      where: { id },
      data,
    });
  },

  async deleteBooking(id: string) {
    return await prisma.booking.delete({
      where: { id },
    });
  },

  // Operaciones para Review
  async getAllReviews() {
    return await prisma.review.findMany({
      include: { tour: true, user: true },
    });
  },

  async getReviewById(id: string) {
    return await prisma.review.findUnique({
      where: { id },
      include: { tour: true, user: true },
    });
  },

  async getReviewsByUser(userId: string) {
    return await prisma.review.findMany({
      where: { userId },
      include: { tour: true },
    });
  },

  async getReviewsByTour(tourId: number) {
    return await prisma.review.findMany({
      where: { tourId },
      include: { user: true },
    });
  },

  async getReviewsByRating(minRating: number) {
    return await prisma.review.findMany({
      where: { rating: { gte: minRating } },
      include: { tour: true, user: true },
    });
  },

  async createReview(data: ReviewInput) {
    return await prisma.review.create({
      data,
    });
  },

  async updateReview(id: string, data: Partial<ReviewInput>) {
    return await prisma.review.update({
      where: { id },
      data,
    });
  },

  async deleteReview(id: string) {
    return await prisma.review.delete({
      where: { id },
    });
  },

  // Operaciones para BlogPost
  async getAllBlogPosts(publishedOnly: boolean = true) {
    return await prisma.blogPost.findMany({
      where: publishedOnly ? { published: true } : undefined,
    });
  },

  async getBlogPostById(id: string) {
    return await prisma.blogPost.findUnique({
      where: { id },
    });
  },

  async getBlogPostBySlug(slug: string) {
    return await prisma.blogPost.findUnique({
      where: { slug },
    });
  },

  async getBlogPostsByCategory(category: string, publishedOnly: boolean = true) {
    return await prisma.blogPost.findMany({
      where: {
        category,
        published: publishedOnly ? true : undefined,
      },
    });
  },

  async createBlogPost(data: BlogPostInput) {
    return await prisma.blogPost.create({
      data,
    });
  },

  async updateBlogPost(id: string, data: Partial<BlogPostInput>) {
    return await prisma.blogPost.update({
      where: { id },
      data,
    });
  },

  async deleteBlogPost(id: string) {
    return await prisma.blogPost.delete({
      where: { id },
    });
  },

  // Operaciones para Supplier
  async getAllSuppliers() {
    return await prisma.supplier.findMany();
  },

  async getSupplierById(id: string) {
    return await prisma.supplier.findUnique({
      where: { id },
    });
  },

  async getSuppliersByCategory(category: string) {
    return await prisma.supplier.findMany({
      where: { category },
    });
  },

  async getSuppliersByStatus(status: string) {
    return await prisma.supplier.findMany({
      where: { status },
    });
  },

  async createSupplier(data: SupplierInput) {
    return await prisma.supplier.create({
      data,
    });
  },

  async updateSupplier(id: string, data: Partial<SupplierInput>) {
    return await prisma.supplier.update({
      where: { id },
      data,
    });
  },

  async deleteSupplier(id: string) {
    return await prisma.supplier.delete({
      where: { id },
    });
  },
};

// Cierra la conexión de Prisma cuando la aplicación se cierra
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default BackendService;