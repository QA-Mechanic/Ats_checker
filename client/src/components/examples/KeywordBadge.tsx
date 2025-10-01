import { KeywordBadge } from "../KeywordBadge"

export default function KeywordBadgeExample() {
  return (
    <div className="p-8 flex flex-wrap gap-3">
      <KeywordBadge keyword="React" variant="matched" count={3} />
      <KeywordBadge keyword="TypeScript" variant="matched" count={5} />
      <KeywordBadge keyword="Node.js" variant="matched" />
      <KeywordBadge keyword="Problem Solving" variant="missing" />
      <KeywordBadge keyword="Team Leadership" variant="missing" />
      <KeywordBadge keyword="Agile" variant="missing" />
    </div>
  )
}
