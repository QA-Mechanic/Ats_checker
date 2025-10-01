import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  FileText, 
  AlertCircle, 
  Lightbulb, 
  Code, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3
} from "lucide-react"

interface EnhancedAnalysisResult {
  matchScore: number
  matchedKeywords: Array<{ keyword: string; count: number }>
  missingKeywords: string[]
  resumeText: string
  suggestions: Array<{
    id: string
    type: 'replace' | 'add' | 'enhance'
    keyword: string
    location: string
    originalText: string
    suggestedText: string
    reason: string
    impact: 'high' | 'medium' | 'low'
    category: 'skills' | 'experience' | 'keywords' | 'formatting'
  }>
  contextualInsights?: {
    resumeStrengths: string[]
    improvementAreas: string[]
    overallTone: string
    experienceLevel: string
  }
}

interface ImprovedAnalysisResultsProps {
  results: EnhancedAnalysisResult
  onNewScan: () => void
  onApplySuggestion: (suggestion: any) => void
  onRegenerateSuggestions: (preferences?: any) => void
  onReAnalyze: () => void
  onDownload: (format: 'pdf' | 'docx') => void
  appliedSuggestions: string[]
  isProcessing: boolean
}

export function ImprovedAnalysisResults({
  results,
  onNewScan,
  onApplySuggestion,
  onRegenerateSuggestions,
  onReAnalyze,
  onDownload,
  appliedSuggestions,
  isProcessing
}: ImprovedAnalysisResultsProps) {
  const { matchScore, matchedKeywords, missingKeywords, suggestions, contextualInsights } = results
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'suggestions'>('overview')

  // Categorize keywords into technical and soft skills
  const categorizeKeywords = (keywords: Array<{ keyword: string; count?: number }> | string[]) => {
    const technicalSkills: Array<{ keyword: string; count?: number }> = []
    const softSkills: Array<{ keyword: string; count?: number }> = []
    
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express',
      'typescript', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
      'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'devops',
      'testing', 'jest', 'cypress', 'selenium', 'webpack', 'vite', 'babel'
    ]
    
    keywords.forEach(item => {
      const keyword = typeof item === 'string' ? item : item.keyword
      const count = typeof item === 'string' ? undefined : item.count
      const keywordLower = keyword.toLowerCase()
      
      const isTechnical = technicalKeywords.some(tech => 
        keywordLower.includes(tech) || tech.includes(keywordLower)
      )
      
      if (isTechnical) {
        technicalSkills.push({ keyword, count })
      } else {
        softSkills.push({ keyword, count })
      }
    })
    
    return { technicalSkills, softSkills }
  }

  const matchedCategorized = categorizeKeywords(matchedKeywords)
  const missingCategorized = categorizeKeywords(missingKeywords)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 65) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500"
    if (score >= 65) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-pink-500"
  }

  const CircularProgress = ({ score }: { score: number }) => (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 70}`}
          strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={score >= 80 ? "stop-green-400" : score >= 65 ? "stop-yellow-400" : "stop-red-400"} />
            <stop offset="100%" className={score >= 80 ? "stop-green-600" : score >= 65 ? "stop-orange-600" : "stop-red-600"} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
        <span className="text-sm text-muted-foreground">ATS Match</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resume Analysis Insights
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onNewScan}>
                New Scan
              </Button>
              <Button variant="outline" size="sm" onClick={onReAnalyze} disabled={isProcessing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Re-scan
              </Button>
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'keywords' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('keywords')}
            >
              Keywords
            </Button>
            <Button
              variant={activeTab === 'suggestions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Circular Progress */}
              <div className="flex flex-col items-center">
                <CircularProgress score={matchScore} />
                <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs">
                  {matchScore >= 80 && "Excellent! Your resume aligns well with job requirements."}
                  {matchScore >= 65 && matchScore < 80 && "Good match. Consider adding missing keywords."}
                  {matchScore < 65 && "Needs optimization. Review suggestions below."}
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-2xl font-bold">{matchedKeywords.length}</p>
                        <p className="text-sm text-muted-foreground">Matched Keywords</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-2xl font-bold">{missingKeywords.length}</p>
                        <p className="text-sm text-muted-foreground">Missing Keywords</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold">{suggestions.length}</p>
                        <p className="text-sm text-muted-foreground">AI Suggestions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold">{appliedSuggestions.length}</p>
                        <p className="text-sm text-muted-foreground">Applied Changes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              {/* Matched Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Code className="h-5 w-5" />
                      Technical Skills Found ({matchedCategorized.technicalSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {matchedCategorized.technicalSkills.map((item, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {item.keyword} {item.count && `(${item.count})`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Users className="h-5 w-5" />
                      Soft Skills Found ({matchedCategorized.softSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {matchedCategorized.softSkills.map((item, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {item.keyword} {item.count && `(${item.count})`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Missing Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <Code className="h-5 w-5" />
                      Technical Skills Missing ({missingCategorized.technicalSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {missingCategorized.technicalSkills.map((item, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          {item.keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <Users className="h-5 w-5" />
                      Soft Skills Missing ({missingCategorized.softSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {missingCategorized.softSkills.map((item, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          {item.keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI-Powered Suggestions</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRegenerateSuggestions()}
                    disabled={isProcessing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Regenerate All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload('pdf')}
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"  
                    size="sm"
                    onClick={() => onDownload('docx')}
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download DOCX
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className={appliedSuggestions.includes(suggestion.id) ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}>
                              {suggestion.impact} impact
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{suggestion.location}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>
                          
                          {suggestion.originalText && (
                            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
                              <div>
                                <span className="font-medium text-destructive">Current:</span>
                                <p className="text-foreground/80 mt-1">{suggestion.originalText}</p>
                              </div>
                              <div>
                                <span className="font-medium text-green-600 dark:text-green-400">Suggested:</span>
                                <p className="text-foreground/80 mt-1">{suggestion.suggestedText}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => onApplySuggestion(suggestion)}
                          disabled={appliedSuggestions.includes(suggestion.id) || isProcessing}
                          variant={appliedSuggestions.includes(suggestion.id) ? "outline" : "default"}
                        >
                          {appliedSuggestions.includes(suggestion.id) ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Applied
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Apply
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contextual Insights */}
      {contextualInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Resume Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400">Strengths</h4>
                <ul className="space-y-2">
                  {contextualInsights.resumeStrengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-orange-600 dark:text-orange-400">Areas for Improvement</h4>
                <ul className="space-y-2">
                  {contextualInsights.improvementAreas?.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex gap-6 text-sm">
              <span><strong>Overall Tone:</strong> {contextualInsights.overallTone}</span>
              <span><strong>Experience Level:</strong> {contextualInsights.experienceLevel}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}