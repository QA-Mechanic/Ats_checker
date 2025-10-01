import { useState } from "react"
import { FileUpload } from "@/components/FileUpload"
import { AnalysisResults } from "@/components/AnalysisResults"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles, ArrowRight, FileText, Zap, Target } from "lucide-react"

export default function HomePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Mock analysis results - will be replaced with real API call
  const mockResults = {
    matchScore: 72,
    matchedKeywords: [
      { keyword: "JavaScript", count: 5 },
      { keyword: "React", count: 3 },
      { keyword: "TypeScript", count: 2 },
      { keyword: "Node.js", count: 4 },
      { keyword: "REST API", count: 2 },
      { keyword: "Git", count: 1 },
    ],
    missingKeywords: [
      "Problem Solving",
      "Team Leadership",
      "Agile Methodology",
      "Communication Skills",
      "Attention to Detail"
    ],
    suggestions: [
      {
        keyword: "Problem Solving",
        location: "Senior Developer Experience Section",
        context: "Led development of microservices architecture for e-commerce platform",
        suggestion: "Led development of microservices architecture for e-commerce platform, demonstrating strong problem-solving skills by identifying and resolving complex technical challenges in distributed systems"
      },
      {
        keyword: "Team Leadership",
        location: "Tech Lead Role Description",
        context: "Managed team of 5 developers on React project",
        suggestion: "Provided team leadership to a group of 5 developers on React project, mentoring junior developers and coordinating sprint planning sessions"
      },
      {
        keyword: "Agile Methodology",
        location: "Project Experience Section",
        context: "Delivered features for customer portal",
        suggestion: "Delivered features for customer portal using Agile methodology, participating in daily standups, sprint planning, and retrospectives"
      }
    ]
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      return
    }

    setIsAnalyzing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
    setShowResults(true)
  }

  const handleNewScan = () => {
    setResumeFile(null)
    setJobDescription("")
    setShowResults(false)
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
            <AnalysisResults {...mockResults} />
          </div>
        )}
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
