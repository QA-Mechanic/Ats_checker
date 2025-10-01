import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KeywordBadgeProps {
  keyword: string
  variant: "matched" | "missing"
  count?: number
}

export function KeywordBadge({ keyword, variant, count }: KeywordBadgeProps) {
  return (
    <Badge
      variant={variant === "matched" ? "default" : "destructive"}
      className={cn(
        "text-sm font-medium px-3 py-1",
        variant === "matched" ? "bg-success hover:bg-success" : ""
      )}
      data-testid={`badge-keyword-${variant}`}
    >
      {keyword}
      {count !== undefined && count > 1 && (
        <span className="ml-1.5 opacity-80">×{count}</span>
      )}
    </Badge>
  )
}
