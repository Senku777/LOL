import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

interface AuthMessageProps {
  type: "error" | "success"
  title?: string
  message: string
}

export function AuthMessage({ type, title, message }: AuthMessageProps) {
  return (
    <Alert variant={type === "error" ? "destructive" : "default"} className="mb-6">
      {type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
