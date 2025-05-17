"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

export default function ReportesPage() {
  const [loading, setLoading] = useState(false)

  const handleDownloadReport = async () => {
    setLoading(true)
    // Simulate a download process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    alert("Reporte descargado!")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="flex items-center justify-between">
        <div>
          {/* Filters and other content can go here */}
          Filtros y otras opciones
        </div>

        <Button onClick={handleDownloadReport} className="ml-auto" disabled={loading}>
          <Download className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Descargar Reporte</span>
        </Button>
      </div>
      {/* Table or other report display content */}
      <div className="mt-4">Contenido del reporte (tabla, gráficos, etc.)</div>
    </div>
  )
}
