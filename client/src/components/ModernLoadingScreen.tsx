import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Search, 
  Lightbulb, 
  Target, 
  CheckCircle,
  Bot,
  Zap,
  Sparkles
} from "lucide-react"

interface LoadingScreenProps {
  isLoading: boolean
  stage?: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete'
  message?: string
}

export function ModernLoadingScreen({ isLoading, stage = 'analyzing', message }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { 
      key: 'uploading', 
      icon: FileText, 
      title: 'Processing Document', 
      description: 'Reading your resume content',
      duration: 1000
    },
    { 
      key: 'extracting', 
      icon: Search, 
      title: 'Extracting Information', 
      description: 'Analyzing text and structure',
      duration: 1500
    },
    { 
      key: 'analyzing', 
      icon: Bot, 
      title: 'AI Analysis', 
      description: 'Comparing with job requirements',
      duration: 2500
    },
    { 
      key: 'generating', 
      icon: Lightbulb, 
      title: 'Generating Insights', 
      description: 'Creating personalized suggestions',
      duration: 2000
    },
    { 
      key: 'complete', 
      icon: CheckCircle, 
      title: 'Analysis Complete', 
      description: 'Ready to view results',
      duration: 500
    }
  ]

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setCurrentStep(0)
      return
    }

    const currentStepIndex = steps.findIndex(step => step.key === stage)
    if (currentStepIndex >= 0) {
      setCurrentStep(currentStepIndex)
    }

    // Simulate progress for current stage
    const targetProgress = ((currentStepIndex + 1) / steps.length) * 100
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isLoading, stage])

  if (!isLoading) return null

  const currentStepData = steps[currentStep]
  const Icon = currentStepData?.icon || Bot

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                <Icon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Zap className="h-5 w-5 text-blue-400 animate-pulse" />
              </div>
            </div>

            {/* Current Step Info */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {currentStepData?.title || 'Processing...'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {message || currentStepData?.description || 'Please wait while we analyze your resume'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStep
                const isComplete = index < currentStep
                
                return (
                  <div
                    key={step.key}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      isComplete
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                )
              })}
            </div>

            {/* Fun Facts */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 {getRandomTip()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRandomTip(): string {
  const tips = [
    "Use action verbs like 'implemented', 'optimized', and 'led' to make your resume more impactful.",
    "Quantify your achievements with numbers and percentages whenever possible.",
    "Tailor your resume keywords to match the job description for better ATS compatibility.",
    "Keep your resume to 1-2 pages for optimal readability and impact.",
    "Use consistent formatting and professional fonts throughout your resume.",
    "Include relevant technical skills that match the job requirements.",
    "Start bullet points with strong action verbs to showcase your accomplishments.",
    "Use industry-specific keywords to improve your resume's searchability."
  ]
  
  return tips[Math.floor(Math.random() * tips.length)]
}