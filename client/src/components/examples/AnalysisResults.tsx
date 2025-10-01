import { AnalysisResults } from "../AnalysisResults"

export default function AnalysisResultsExample() {
  const mockData = {
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <AnalysisResults {...mockData} />
    </div>
  )
}
