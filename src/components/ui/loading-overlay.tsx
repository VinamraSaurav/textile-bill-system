import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  className?: string
}

export function LoadingOverlay({ isLoading, text = "Loading...", className }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <Spinner size="lg" className="text-primary" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  )
}
