import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchScore } from "./MatchScore"
import { KeywordBadge } from "./KeywordBadge"
import { SuggestionCard } from "./SuggestionCard"
import { Separator } from "@/components/ui/separator"
import { FileText, Target, AlertCircle, Lightbulb } from "lucide-react"

interface AnalysisResultsProps {
  matchScore: number
  matchedKeywords: Array<{ keyword: string; count: number }>
  missingKeywords: string[]
  suggestions: Array<{
    keyword: string
    location: string
    context: string
    suggestion: string
  }>
}

export function AnalysisResults({
  matchScore,
  matchedKeywords,
  missingKeywords,
  suggestions
}: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Match Score Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            ATS Match Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <MatchScore score={matchScore} size="lg" />
          <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
            {matchScore >= 80 && "Excellent match! Your resume aligns well with the job requirements."}
            {matchScore >= 65 && matchScore < 80 && "Good match. Consider adding the missing keywords to improve your score."}
            {matchScore < 65 && "Your resume needs optimization. Review the suggestions below to improve your match rate."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Matched Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Matched Keywords
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {matchedKeywords.length} found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map(({ keyword, count }, index) => (
                <KeywordBadge 
                  key={index} 
                  keyword={keyword} 
                  variant="matched" 
                  count={count}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Missing Keywords
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {missingKeywords.length} missing
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <KeywordBadge 
                  key={index} 
                  keyword={keyword} 
                  variant="missing" 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">AI-Powered Suggestions</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Based on your resume content, here's where and how to add the missing keywords:
          </p>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                {...suggestion}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
