"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Repeat,
  Truck,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const adminRoutes = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/admin/productos",
    icon: ShoppingBag,
  },
  {
    title: "Suscripciones",
    href: "/admin/suscripciones",
    icon: Repeat,
  },
  {
    title: "Proveedores",
    href: "/admin/proveedores",
    icon: Truck,
  },
  {
    title: "Contenido Educativo",
    href: "/admin/contenido",
    icon: FileText,
  },
  {
    title: "Tours Virtuales",
    href: "/admin/tours",
    icon: Calendar,
  },
  {
    title: "Reportes",
    href: "/admin/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/admin" className="flex items-center">
            <span className="text-xl font-bold text-primary">Brotato</span>
            <span className="ml-2 text-sm text-muted-foreground">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("absolute right-2", collapsed && "right-[-12px] bg-background border rounded-full")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="py-4">
          <nav className="grid gap-1 px-2">
            {adminRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <route.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                {!collapsed && <span>{route.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="my-4" />
        <div className="px-4">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>Brotato Farm Admin</p>
              <p>v1.0.0</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
