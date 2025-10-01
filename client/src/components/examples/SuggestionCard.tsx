import { SuggestionCard } from "../SuggestionCard"

export default function SuggestionCardExample() {
  return (
    <div className="p-8 max-w-3xl space-y-4">
      <SuggestionCard
        keyword="problem-solving"
        location="Senior Developer Experience Section"
        context="Led development of microservices architecture for e-commerce platform"
        suggestion="Led development of microservices architecture for e-commerce platform, demonstrating strong problem-solving skills by identifying and resolving complex technical challenges in distributed systems"
        defaultExpanded={true}
      />
      <SuggestionCard
        keyword="team collaboration"
        location="Project Manager Role"
        context="Managed cross-functional team of 8 developers"
        suggestion="Managed cross-functional team of 8 developers through effective team collaboration, facilitating daily standups and sprint planning sessions"
      />
    </div>
  )
}
