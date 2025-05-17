"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Datos de ejemplo para los artículos del blog
const blogPosts = [
  {
    id: 1,
    title: "Beneficios de los huevos orgánicos para tu salud",
    excerpt:
      "Descubre por qué los huevos de gallinas criadas en libertad son mejores para tu salud y el medio ambiente.",
    content: `
      <p>Los huevos orgánicos son aquellos que provienen de gallinas criadas en libertad, alimentadas con piensos ecológicos y sin el uso de antibióticos ni hormonas. Estos huevos son cada vez más populares debido a sus beneficios para la salud y el medio ambiente.</p>
      
      <h2>Mayor valor nutricional</h2>
      <p>Diversos estudios han demostrado que los huevos de gallinas criadas en libertad contienen:</p>
      <ul>
        <li>Hasta un 30% más de vitamina E</li>
        <li>Hasta un 50% más de ácidos grasos omega-3</li>
        <li>Menor contenido de colesterol</li>
        <li>Mayor cantidad de vitamina A y D</li>
      </ul>
      
      <h2>Mejor sabor y calidad</h2>
      <p>Las gallinas que se alimentan de forma natural y viven en espacios abiertos producen huevos con un sabor más intenso y yemas de color más anaranjado, indicativo de su alto contenido en carotenoides y antioxidantes.</p>
      
      <h2>Beneficios medioambientales</h2>
      <p>La producción de huevos orgánicos también tiene un impacto positivo en el medio ambiente:</p>
      <ul>
        <li>Menor huella de carbono</li>
        <li>No utilización de pesticidas ni fertilizantes químicos</li>
        <li>Mejor bienestar animal</li>
        <li>Conservación de la biodiversidad local</li>
      </ul>
      
      <h2>¿Cómo identificar huevos verdaderamente orgánicos?</h2>
      <p>Para asegurarte de que estás comprando huevos realmente orgánicos, busca certificaciones oficiales en el empaque y verifica que provengan de granjas con prácticas sostenibles y transparentes como Brotato Farm.</p>
      
      <p>En nuestra granja, nos enorgullece ofrecer huevos de la más alta calidad, provenientes de gallinas felices que viven en condiciones óptimas y se alimentan de manera natural. Esto no solo beneficia tu salud, sino que también contribuye a un sistema alimentario más sostenible y ético.</p>
    `,
    author: "María Rodríguez",
    date: "2023-05-15",
    readTime: "5 min",
    image: "/free-range-chickens.png",
    category: "Nutrición",
  },
  {
    id: 2,
    title: "Cómo criar pollos en libertad: Guía para principiantes",
    excerpt: "Aprende los fundamentos para criar pollos felices y saludables en tu propio patio trasero.",
    content: `
      <p>Criar pollos en libertad puede ser una experiencia gratificante que te proporciona huevos frescos y la satisfacción de saber exactamente de dónde viene tu comida. Esta guía te ayudará a comenzar con el pie derecho.</p>
      
      <h2>Beneficios de criar pollos en libertad</h2>
      <p>Antes de comenzar, es importante entender por qué vale la pena criar pollos en libertad:</p>
      <ul>
        <li>Huevos más saludables y sabrosos</li>
        <li>Control sobre la alimentación y condiciones de vida de las aves</li>
        <li>Reducción de residuos domésticos (los pollos comen restos de comida)</li>
        <li>Control natural de plagas en tu jardín</li>
        <li>Abono orgánico de alta calidad para tu huerto</li>
      </ul>
      
      <h2>Primeros pasos</h2>
      <p>Para comenzar a criar pollos en libertad, necesitarás:</p>
      <ol>
        <li><strong>Un gallinero seguro:</strong> Debe proteger a tus aves de depredadores y condiciones climáticas adversas.</li>
        <li><strong>Un área cercada:</strong> Donde tus gallinas puedan picotear, tomar baños de polvo y comportarse naturalmente.</li>
        <li><strong>Comederos y bebederos:</strong> Asegúrate de que sean fáciles de limpiar y rellenar.</li>
        <li><strong>Nidos:</strong> Lugares cómodos y privados donde tus gallinas pondrán huevos.</li>
        <li><strong>Perchas:</strong> Las gallinas prefieren dormir en alto, así que proporcionales perchas elevadas.</li>
      </ol>
      
      <h2>Selección de razas</h2>
      <p>No todas las razas de gallinas son iguales. Algunas son mejores ponedoras, otras son más resistentes al frío o al calor. Algunas razas recomendadas para principiantes incluyen:</p>
      <ul>
        <li>Rhode Island Red: Excelentes ponedoras y bastante resistentes.</li>
        <li>Plymouth Rock: Dóciles y buenas ponedoras de huevos marrones.</li>
        <li>Sussex: Amigables y adaptables a diferentes climas.</li>
        <li>Leghorn: Increíbles ponedoras de huevos blancos.</li>
      </ul>
      
      <h2>Alimentación adecuada</h2>
      <p>Una alimentación balanceada es crucial para la salud de tus gallinas y la calidad de sus huevos. Deberás proporcionarles:</p>
      <ul>
        <li>Alimento comercial para gallinas ponedoras (16-18% de proteína)</li>
        <li>Acceso a vegetación fresca y insectos (en su área de pastoreo)</li>
        <li>Grit (piedrecillas pequeñas que ayudan en la digestión)</li>
        <li>Suplemento de calcio (cáscaras de huevo trituradas o concha de ostra)</li>
        <li>Agua fresca y limpia en todo momento</li>
      </ul>
      
      <p>Recuerda que criar pollos en libertad requiere dedicación diaria, pero los beneficios bien valen el esfuerzo. En Brotato Farm estamos comprometidos con las mejores prácticas de crianza y bienestar animal, y esperamos que esta guía te inspire a seguir nuestro ejemplo.</p>
    `,
    author: "Carlos Méndez",
    date: "2023-06-22",
    readTime: "8 min",
    image: "/aerial-chicken-farm.png",
    category: "Guías prácticas",
  },
  {
    id: 3,
    title: "Recetas deliciosas con pollo orgánico",
    excerpt: "Descubre estas recetas saludables y deliciosas utilizando pollo criado en libertad.",
    content: `
      <p>El pollo orgánico criado en libertad no solo es más ético y sostenible, sino que también ofrece un sabor superior y una textura más firme que lo hace perfecto para una variedad de recetas. Aquí te compartimos algunas de nuestras recetas favoritas que resaltan la calidad de este ingrediente excepcional.</p>
      
      <h2>Pollo asado con hierbas frescas</h2>
      <p><strong>Ingredientes:</strong></p>
      <ul>
        <li>1 pollo orgánico entero (aproximadamente 1.8 kg)</li>
        <li>3 cucharadas de mantequilla sin sal, a temperatura ambiente</li>
        <li>2 cucharadas de aceite de oliva extra virgen</li>
        <li>4 dientes de ajo, finamente picados</li>
        <li>2 cucharadas de hierbas frescas picadas (romero, tomillo, salvia)</li>
        <li>1 limón, cortado por la mitad</li>
        <li>Sal marina y pimienta negra recién molida</li>
      </ul>
      
      <p><strong>Preparación:</strong></p>
      <ol>
        <li>Precalienta el horno a 190°C.</li>
        <li>Seca bien el pollo con toallas de papel, por dentro y por fuera.</li>
        <li>En un tazón pequeño, mezcla la mantequilla, el aceite de oliva, el ajo, las hierbas, la sal y la pimienta.</li>
        <li>Con cuidado, separa la piel del pollo de la carne en la zona de la pechuga y los muslos, sin romperla.</li>
        <li>Introduce parte de la mezcla de mantequilla bajo la piel y esparce el resto por toda la superficie del pollo.</li>
        <li>Coloca las mitades de limón dentro de la cavidad del pollo.</li>
        <li>Ata las patas del pollo con hilo de cocina y colócalo en una fuente para horno.</li>
        <li>Asa durante aproximadamente 1 hora y 20 minutos, o hasta que el jugo que salga al pinchar entre el muslo y el cuerpo sea transparente.</li>
        <li>Deja reposar el pollo durante 10-15 minutos antes de trincharlo.</li>
      </ol>
      
      <h2>Ensalada de pollo con aguacate y mango</h2>
      <p><strong>Ingredientes:</strong></p>
      <ul>
        <li>2 pechugas de pollo orgánico, cocidas y desmenuzadas</li>
        <li>1 aguacate maduro, cortado en cubos</li>
        <li>1 mango maduro, cortado en cubos</li>
        <li>1/4 de cebolla roja, finamente picada</li>
        <li>1 puñado de cilantro fresco, picado</li>
        <li>Jugo de 1 lima</li>
        <li>2 cucharadas de aceite de oliva</li>
        <li>Sal y pimienta al gusto</li>
        <li>Hojas de lechuga para servir</li>
      </ul>
      
      <p><strong>Preparación:</strong></p>
      <ol>
        <li>En un tazón grande, combina el pollo desmenuzado, el aguacate, el mango y la cebolla.</li>
        <li>En un tazón pequeño, mezcla el cilantro, el jugo de lima, el aceite de oliva, la sal y la pimienta.</li>
        <li>Vierte el aderezo sobre la mezcla de pollo y revuelve suavemente.</li>
        <li>Sirve sobre hojas de lechuga fresca.</li>
      </ol>
      
      <h2>Caldo de pollo casero</h2>
      <p>No hay nada más reconfortante y nutritivo que un caldo de pollo casero hecho con pollo orgánico. Los huesos y cartílagos liberan colágeno y minerales que no solo enriquecen el sabor sino que también aportan beneficios para la salud.</p>
      
      <p><strong>Ingredientes:</strong></p>
      <ul>
        <li>1 carcasa de pollo orgánico (después de haber usado la carne)</li>
        <li>2 zanahorias, cortadas en trozos grandes</li>
        <li>2 tallos de apio, cortados en trozos grandes</li>
        <li>1 cebolla, cortada por la mitad</li>
        <li>4 dientes de ajo, aplastados</li>
        <li>1 hoja de laurel</li>
        <li>1 ramita de tomillo</li>
        <li>1 cucharadita de granos de pimienta negra</li>
        <li>Sal al gusto</li>
        <li>3 litros de agua fría</li>
      </ul>
      
      <p><strong>Preparación:</strong></p>
      <ol>
        <li>Coloca todos los ingredientes en una olla grande.</li>
        <li>Lleva a ebullición y luego reduce el fuego a mínimo.</li>
        <li>Deja cocer a fuego lento durante 3-4 horas, retirando la espuma que se forme en la superficie.</li>
        <li>Cuela el caldo y úsalo como base para sopas o guarda en el refrigerador hasta por 3 días (o congela para uso posterior).</li>
      </ol>
      
      <p>En Brotato Farm, creemos que la calidad de los ingredientes marca la diferencia en cualquier receta. Nuestro pollo orgánico, criado en libertad y alimentado naturalmente, es perfecto para estas y muchas otras preparaciones culinarias.</p>
    `,
    author: "Ana Martínez",
    date: "2023-07-10",
    readTime: "6 min",
    image: "/grilled-chicken-platter.png",
    category: "Recetas",
  },
]

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    setIsLoading(true)

    setTimeout(() => {
      const postId = Number(params.id)
      const foundPost = blogPosts.find((p) => p.id === postId)

      if (foundPost) {
        setPost(foundPost)
      } else {
        toast({
          title: "Artículo no encontrado",
          description: "El artículo que buscas no existe o ha sido eliminado.",
          variant: "destructive",
        })
        router.push("/blog")
      }

      setIsLoading(false)
    }, 500)
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="container py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al blog
      </Button>

      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(post.date).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {post.readTime} de lectura
          </div>
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        </div>

        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        <Separator className="my-8" />

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">Categoría: </span>
            <span className="text-sm text-muted-foreground">{post.category}</span>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </article>
    </div>
  )
}
