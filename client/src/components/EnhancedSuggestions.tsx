import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download, 
  Edit3,
  Lightbulb,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"

interface EnhancedSuggestion {
  id: string
  type: 'replace' | 'add' | 'enhance'
  keyword: string
  location: string
  originalText: string
  suggestedText: string
  reason: string
  impact: 'high' | 'medium' | 'low'
  category: 'skills' | 'experience' | 'keywords' | 'formatting'
}

interface ContextualInsights {
  resumeStrengths: string[]
  improvementAreas: string[]
  overallTone: string
  experienceLevel: string
}

interface AnalysisResult {
  matchScore: number
  matchedKeywords: Array<{ keyword: string; count: number }>
  missingKeywords: string[]
  resumeText: string
  suggestions: EnhancedSuggestion[]
  contextualInsights?: ContextualInsights
}

interface EnhancedSuggestionsProps {
  results: AnalysisResult
  onNewScan: () => void
  onApplySuggestion: (suggestion: EnhancedSuggestion) => void
  onRegenerateSuggestions: (preferences?: any) => void
  onReAnalyze: () => void
  onDownload: (format: 'pdf' | 'docx') => void
  appliedSuggestions: string[]
  isProcessing: boolean
}

export function EnhancedSuggestions({
  results,
  onNewScan,
  onApplySuggestion,
  onRegenerateSuggestions,
  onReAnalyze,
  onDownload,
  appliedSuggestions = [],
  isProcessing = false
}: EnhancedSuggestionsProps) {
  const { matchScore, matchedKeywords, missingKeywords, resumeText, suggestions, contextualInsights } = results
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'replace': return <Edit3 className="h-4 w-4" />
      case 'add': return <Zap className="h-4 w-4" />
      case 'enhance': return <TrendingUp className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion => {
    const categoryMatch = selectedCategory === 'all' || suggestion.category === selectedCategory
    const impactMatch = selectedImpact === 'all' || suggestion.impact === selectedImpact
    return categoryMatch && impactMatch
  })

  const isSuggestionApplied = (suggestionId: string) => {
    return appliedSuggestions.includes(suggestionId)
  }

  return (
    <div className="space-y-6">
      {/* Overall Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resume Analysis Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current ATS Match Score</span>
            <div className="flex items-center gap-2">
              <Progress value={matchScore} className="w-32" />
              <span className="text-sm font-bold">{matchScore}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">Strengths</h4>
              <ul className="text-sm space-y-1">
                {contextualInsights?.resumeStrengths?.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                )) || <li className="text-muted-foreground">No strengths identified</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-orange-600 dark:text-orange-400">Improvement Areas</h4>
              <ul className="text-sm space-y-1">
                {contextualInsights?.improvementAreas?.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                    {area}
                  </li>
                )) || <li className="text-muted-foreground">No improvement areas identified</li>}
              </ul>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <span><strong>Tone:</strong> {contextualInsights?.overallTone || 'Not analyzed'}</span>
            <span><strong>Level:</strong> {contextualInsights?.experienceLevel || 'Not determined'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Suggestions ({filteredSuggestions.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateSuggestions({ focus: selectedCategory, impact: selectedImpact })}
                disabled={isProcessing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Regenerate All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateSuggestions({ focus: 'skills' })}
                disabled={isProcessing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Skills Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateSuggestions({ focus: 'experience' })}
                disabled={isProcessing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Experience Only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Badge>
              {['skills', 'experience', 'keywords', 'formatting'].map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex gap-1">
              <Badge 
                variant={selectedImpact === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedImpact('all')}
              >
                All Impact
              </Badge>
              {['high', 'medium', 'low'].map(impact => (
                <Badge
                  key={impact}
                  variant={selectedImpact === impact ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedImpact(impact)}
                >
                  {impact}
                </Badge>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className={`${isSuggestionApplied(suggestion.id) ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.type)}
                        <Badge variant="outline" className="capitalize">
                          {suggestion.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {suggestion.category}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getImpactColor(suggestion.impact)}`} />
                        <span className="text-xs text-muted-foreground capitalize">
                          {suggestion.impact} impact
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-sm">{suggestion.location}</p>
                        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                      </div>

                      {suggestion.originalText && (
                        <div className="bg-muted/50 p-3 rounded-md text-sm">
                          <p className="text-destructive mb-1"><strong>Current:</strong></p>
                          <p className="mb-2 text-foreground/80">{suggestion.originalText}</p>
                          <p className="text-green-600 dark:text-green-400 mb-1"><strong>Suggested:</strong></p>
                          <p className="text-foreground/80">{suggestion.suggestedText}</p>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion)}
                      disabled={isSuggestionApplied(suggestion.id) || isProcessing}
                      variant={isSuggestionApplied(suggestion.id) ? "outline" : "default"}
                    >
                      {isSuggestionApplied(suggestion.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No suggestions match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onReAnalyze} disabled={isProcessing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Re-scan ATS Score
            </Button>
            <Button onClick={() => onDownload('docx')} disabled={isProcessing}>
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
            <Button onClick={() => onDownload('pdf')} disabled={isProcessing}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}