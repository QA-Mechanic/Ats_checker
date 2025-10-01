# ATS Resume Checker - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid - Professional SaaS Application
- **Inspiration:** Jobscan, Grammarly, Linear (for clean data presentation)
- **Rationale:** Utility-focused application requiring clear data visualization, professional credibility, and efficient workflow
- **Core Principle:** Trust through clarity - users need confidence in AI analysis while easily understanding actionable insights

## Color Palette

**Light Mode:**
- Primary: 217 91% 60% (Professional blue - trust and technology)
- Success: 142 76% 36% (Match indicators, positive feedback)
- Warning: 38 92% 50% (Areas needing attention)
- Error: 0 84% 60% (Critical missing keywords)
- Background: 0 0% 100%
- Surface: 210 20% 98%
- Text Primary: 222 47% 11%
- Text Secondary: 215 16% 47%

**Dark Mode:**
- Primary: 217 91% 65%
- Success: 142 76% 45%
- Warning: 38 92% 60%
- Error: 0 84% 65%
- Background: 222 47% 11%
- Surface: 217 19% 18%
- Text Primary: 210 20% 98%
- Text Secondary: 217 10% 70%

## Typography

**Font Families:**
- Headings: 'Inter', sans-serif (600-700 weight) - modern, professional
- Body: 'Inter', sans-serif (400-500 weight)
- Code/Data: 'JetBrains Mono', monospace (for match percentages, stats)

**Scale:**
- Hero/Display: text-5xl (3rem)
- Page Titles: text-3xl (1.875rem)
- Section Headers: text-2xl (1.5rem)
- Card Titles: text-lg (1.125rem)
- Body: text-base (1rem)
- Captions/Labels: text-sm (0.875rem)
- Match Score: text-6xl (3.75rem, bold, monospace)

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6
- Inner content: space-y-4

**Grid System:**
- Main container: max-w-7xl mx-auto
- Upload section: max-w-4xl centered
- Results dashboard: Two-column layout (lg:grid-cols-3 - sidebar + main content)
- Keyword cards: grid-cols-1 md:grid-cols-2 gap-6

## Component Library

### Upload Interface
- **Hero Section:** Centered upload zone with drag-and-drop area (dashed border, hover state with primary color)
- **File Input:** Large dropzone (min-h-64) with icon, supporting text "PDF or DOCX up to 10MB"
- **Job Description:** Full-width textarea with character counter, min-h-48, placeholder with sample text

### Results Dashboard

**Match Score Card (Prominent):**
- Circular progress indicator (large, 200px diameter)
- Percentage displayed in center (text-6xl, monospace, colored by score: <65% red, 65-79% warning, 80%+ success)
- Subtitle explaining score meaning
- Card elevation with subtle shadow

**Missing Keywords Section:**
- Chip/badge layout for each missing keyword (error color background, rounded-full)
- Count badge showing total missing keywords
- Grouped by category: Hard Skills, Soft Skills, Industry Terms
- Each keyword expandable to show AI suggestion on where to add it

**Matched Keywords Section:**
- Success-colored badges for matched terms
- Visual distinction between hard skills, soft skills, education
- Frequency indicator (how many times keyword appears)

**AI Suggestions Panel:**
- Left sidebar (sticky position) or expandable accordion per keyword
- Each suggestion includes:
  - Keyword being addressed
  - Current resume context (quoted section)
  - Specific recommendation with example sentence
  - Location suggestion (e.g., "Add to Project Experience section")
- Copy button for suggested text

**Detailed Analysis Cards:**
- ATS Compatibility Score (formatting check)
- Word Count Comparison
- Section-by-section breakdown
- Action items list with checkboxes

### Navigation
- Simple header with logo, "New Scan" button
- Minimal footer with links

## Visual Treatments

**Cards:** 
- Rounded corners (rounded-lg)
- Subtle shadows (shadow-sm to shadow-md)
- Hover lift effect on interactive cards
- Border on dark mode for definition

**Data Visualization:**
- Horizontal bar charts for skill category coverage
- Radial progress for match percentage
- Color-coded chips for keyword status
- Subtle background patterns in stat cards

**Interactive States:**
- Upload zone: Border color change on drag-over (primary color, border-2)
- Buttons: Solid primary for main actions, outline for secondary
- Hover states: Slight scale (scale-105) on cards
- Loading states: Skeleton screens during AI analysis, progress bar showing analysis steps

## Animations

**Minimal and purposeful:**
- Fade-in for results dashboard (duration-300)
- Slide-up for suggestion cards
- Smooth progress bar animation during analysis
- Pulse effect on upload zone during drag-over

## Images

**Hero Section Image:**
- Professional illustration or abstract graphic showing resume + AI analysis concept
- Placement: Right side of split hero (40% width) or background with overlay
- Style: Modern, minimal line art or isometric illustration in brand colors
- Alternative: Skip hero image, lead directly with upload interface for faster workflow

**Icon Usage:**
- Heroicons for UI elements (document, check, exclamation)
- Upload icon: Large document with upload arrow
- Match score: Target/bullseye icon
- Suggestions: Lightbulb or sparkle icon

## Page Structure

**Landing/Upload View:**
1. Header with logo + navigation
2. Hero section (h-screen or 80vh): Upload interface centered, supporting text, trust indicators (e.g., "Powered by GPT-4")
3. Brief "How it works" (3-step process, horizontal cards)
4. CTA to start scanning

**Results View:**
1. Header with "Back to Upload" option
2. Match score prominence (top center)
3. Three-column dashboard: 
   - Left: AI Suggestions sidebar
   - Center: Detailed analysis, matched/missing keywords
   - Right: Quick stats, action items
4. Expandable sections for detailed breakdowns

**Responsive Behavior:**
- Mobile: Stack all columns vertically, sticky match score header
- Tablet: Two-column layout
- Desktop: Full three-column dashboard

This design prioritizes clarity, actionability, and professional credibility while making AI insights easily digestible and implementable for job seekers.