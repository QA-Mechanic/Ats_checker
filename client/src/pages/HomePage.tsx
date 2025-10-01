import { useState } from "react"
import { FileUpload } from "@/components/FileUpload"
import { ImprovedAnalysisResults } from "@/components/ImprovedAnalysisResults"
import { ModernLoadingScreen } from "@/components/ModernLoadingScreen"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles, ArrowRight, FileText, Zap, Target } from "lucide-react"

interface AnalysisResult {
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
  contextualInsights: {
    resumeStrengths: string[]
    improvementAreas: string[]
    overallTone: string
    experienceLevel: string
  }
}

export default function HomePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState<'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete'>('analyzing')
  const [showResults, setShowResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([])
  const [updatedResumeText, setUpdatedResumeText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      setAnalysisStage('uploading')
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('jobDescription', jobDescription)

      setAnalysisStage('extracting')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Analysis failed')
      }

      setAnalysisStage('analyzing')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX
      
      setAnalysisStage('generating')
      const results = await response.json()
      
      setAnalysisStage('complete')
      await new Promise(resolve => setTimeout(resolve, 300)) // Brief pause to show completion
      
      setAnalysisResults(results)
      setUpdatedResumeText(results.resumeText) // Set initial resume text
      setShowResults(true)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewScan = () => {
    setResumeFile(null)
    setJobDescription("")
    setShowResults(false)
    setAnalysisResults(null)
    setError(null)
    setAppliedSuggestions([])
    setUpdatedResumeText("")
  }

  const handleApplySuggestion = async (suggestion: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/apply-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: updatedResumeText,
          suggestion: suggestion
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply suggestion')
      }

      const result = await response.json()
      setUpdatedResumeText(result.updatedResume)
      setAppliedSuggestions(prev => [...prev, suggestion.id])
    } catch (error) {
      console.error('Apply suggestion error:', error)
      setError('Failed to apply suggestion')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegenerateSuggestions = async (preferences?: any) => {
    if (!analysisResults) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/regenerate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: updatedResumeText,
          jobDescription: jobDescription,
          preferences: preferences
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate suggestions')
      }

      const result = await response.json()
      setAnalysisResults(prev => ({
        ...prev!,
        suggestions: result.suggestions,
        contextualInsights: result.contextualInsights
      }))
    } catch (error) {
      console.error('Regenerate suggestions error:', error)
      setError('Failed to regenerate suggestions')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReAnalyze = async () => {
    if (!updatedResumeText || !jobDescription) {
      setError('No changes to re-analyze')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/re-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: updatedResumeText,
          jobDescription: jobDescription
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to re-analyze resume')
      }

      const result = await response.json()
      setAnalysisResults(result)
    } catch (error) {
      console.error('Re-analyze error:', error)
      setError('Failed to re-analyze resume')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      if (!updatedResumeText) {
        setError('No resume text available for download')
        return
      }

      const response = await fetch(`/api/download/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: updatedResumeText,
          fileName: `improved_resume_${Date.now()}`
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`)
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `improved_resume_${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      setError(`Failed to download ${format.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">ATS Resume Checker</h1>
          </div>
          <div className="flex items-center gap-2">
            {showResults && (
              <Button 
                variant="outline" 
                onClick={handleNewScan}
                data-testid="button-new-scan"
              >
                New Scan
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold tracking-tight">
                Optimize Your Resume for ATS
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your resume and paste a job description to get AI-powered insights on how to improve your match score and increase your chances of getting interviews.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Keyword Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Identify matched and missing keywords from job descriptions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Match Score</h3>
                      <p className="text-sm text-muted-foreground">
                        Get a percentage score showing resume-job compatibility
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">AI Suggestions</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive context-aware recommendations for improvements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </span>
                  Upload Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileSelect={setResumeFile} 
                  selectedFile={resumeFile}
                />
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </span>
                  Paste Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here... Include requirements, responsibilities, and qualifications."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-48 resize-none"
                  data-testid="input-job-description"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {jobDescription.length} characters
                </p>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive font-medium">Error: {error}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please try again or contact support if the problem persists.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
                className="min-w-48"
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {analysisResults && (
              <ImprovedAnalysisResults
                results={analysisResults}
                onNewScan={handleNewScan}
                onApplySuggestion={handleApplySuggestion}
                onRegenerateSuggestions={handleRegenerateSuggestions}
                onReAnalyze={handleReAnalyze}
                onDownload={handleDownload}
                appliedSuggestions={appliedSuggestions}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}
        
        {/* Modern Loading Screen */}
        <ModernLoadingScreen 
          isLoading={isAnalyzing} 
          stage={analysisStage}
        />
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Optimized for ATS • Get More Interviews</p>
        </div>
      </footer>
    </div>
  )
}
