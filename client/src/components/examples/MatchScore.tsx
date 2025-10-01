import { MatchScore } from "../MatchScore"

export default function MatchScoreExample() {
  return (
    <div className="p-8 flex gap-8 items-center justify-center">
      <MatchScore score={85} size="lg" />
      <MatchScore score={68} size="lg" />
      <MatchScore score={45} size="lg" />
    </div>
  )
}
