import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 border-blue-600",
          sizes[size]
        )}
      />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-slate-500">Loading data...</p>
    </div>
  )
}