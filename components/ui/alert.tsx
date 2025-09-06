import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "error"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100",
      info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
      success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
      warning: "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200",
      error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    }

    const icons = {
      default: <Info className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      error: <XCircle className="h-4 w-4" />
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3 w-full rounded-lg border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="flex-1">{children}</div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-medium leading-none tracking-tight mb-1", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }