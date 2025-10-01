import { useState } from "react"
import { Lightbulb, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SuggestionCardProps {
  keyword: string
  location: string
  context: string
  suggestion: string
  defaultExpanded?: boolean
}

export function SuggestionCard({ 
  keyword, 
  location, 
  context, 
  suggestion,
  defaultExpanded = false 
}: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover-elevate pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-expand-suggestion"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="rounded-md bg-primary/10 p-2 mt-0.5">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-2">
                Add "{keyword}"
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Suggested location: <span className="font-medium text-foreground">{location}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Current context:</p>
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm text-muted-foreground italic">"{context}"</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Suggested improvement:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                data-testid="button-copy-suggestion"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
              <p className="text-sm" data-testid="text-suggestion">{suggestion}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
