"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import ProductGrid  from "@/components/product/product-grid"
import { Loader2, Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  stock: number
  featured?: boolean
}

export default function CatalogoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [categories, setCategories] = useState({
    huevos: true,
    carne: true,
    sostenibilidad: true,
    general: true
  })
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [maxPrice, setMaxPrice] = useState(100)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedPriceRange = useDebounce(priceRange, 300)

  useEffect(() => {
    const fetchProductsAndMaxPrice = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/products')
        const { products } = await response.json()
        setFilteredProducts(products)

        if (products.length > 0) {
          const max = Math.max(...products.map((p: Product) => p.price))
          setMaxPrice(Math.ceil(max))
          setPriceRange([0, Math.ceil(max)])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductsAndMaxPrice()
  }, [])

  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        
        const selectedCategories = Object.entries(categories)
          .filter(([_, checked]) => checked)
          .map(([category]) => category)
          .join(',')
        
        if (selectedCategories) params.append('category', selectedCategories)
        params.append('minPrice', debouncedPriceRange[0].toString())
        params.append('maxPrice', debouncedPriceRange[1].toString())
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)

        const response = await fetch(`/api/products?${params.toString()}`)
        const { products } = await response.json()
        setFilteredProducts(products)
      } catch (error) {
        console.error("Error applying filters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    applyFilters()
  }, [categories, debouncedPriceRange, debouncedSearchTerm])

  const handleCategoryChange = (category: keyof typeof categories, checked: boolean) => {
    setCategories((prev) => ({ ...prev, [category]: checked }))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange([0, maxPrice])
    setCategories({
      huevos: true,
      carne: true,
      sostenibilidad: true,
      general: true
    })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <p className="text-muted-foreground">Explora nuestra selección de productos frescos y orgánicos</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Buscar</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Categorías</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="huevos"
                  checked={categories.huevos}
                  onCheckedChange={(checked) => handleCategoryChange("huevos", checked === true)}
                />
                <Label htmlFor="huevos">Huevos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="carne"
                  checked={categories.carne}
                  onCheckedChange={(checked) => handleCategoryChange("carne", checked === true)}
                />
                <Label htmlFor="carne">Carne de Pollo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sostenibilidad"
                  checked={categories.sostenibilidad}
                  onCheckedChange={(checked) => handleCategoryChange("sostenibilidad", checked === true)}
                />
                <Label htmlFor="sostenibilidad">Sostenibilidad</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="general"
                  checked={categories.general}
                  onCheckedChange={(checked) => handleCategoryChange("general", checked === true)}
                />
                <Label htmlFor="general">General</Label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Precio</h3>
            <div className="space-y-4">
              <Slider 
                value={priceRange} 
                min={0} 
                max={maxPrice} 
                step={1} 
                onValueChange={setPriceRange} 
                className="py-4" 
              />
              <div className="flex items-center justify-between">
                <span>${priceRange[0].toFixed(2)}</span>
                <span>${priceRange[1].toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button onClick={clearFilters} variant="outline" className="w-full">
            Limpiar Filtros
          </Button>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground mb-4">Intenta con otros filtros o términos de búsqueda</p>
              <Button onClick={clearFilters}>Limpiar Filtros</Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-muted-foreground">
                Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <ProductGrid products={filteredProducts} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}