import type React from "react"
import { CheckoutProvider } from "@/contexts/checkout-context"

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>
}
