import { cn } from "@/lib/utils"

interface MatchScoreProps {
  score: number
  size?: "sm" | "lg"
}

export function MatchScore({ score, size = "lg" }: MatchScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 65) return "text-warning"
    return "text-destructive"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-success"
    if (score >= 65) return "stroke-warning"
    return "stroke-destructive"
  }

  const radius = size === "lg" ? 90 : 45
  const strokeWidth = size === "lg" ? 12 : 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      size === "lg" ? "w-52 h-52" : "w-28 h-28"
    )}>
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getStrokeColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className={cn(
            "font-mono font-bold",
            size === "lg" ? "text-6xl" : "text-3xl",
            getScoreColor(score)
          )}
          data-testid="text-match-score"
        >
          {score}%
        </span>
        {size === "lg" && (
          <span className="text-sm text-muted-foreground mt-1">Match Score</span>
        )}
      </div>
    </div>
  )
}
