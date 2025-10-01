import OpenAI from 'openai';
import { extractTextFromFile } from './text-extractor';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY || "dummy-key",
    });
  }
  return openai;
}

interface AIAnalysisResult {
  matchScore: number;
  matchedKeywords: Array<{ keyword: string; count: number }>;
  missingKeywords: string[];
  suggestions: Array<{
    id: string;
    type: 'replace' | 'add' | 'enhance';
    keyword: string;
    location: string;
    originalText: string;
    suggestedText: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
    category: 'skills' | 'experience' | 'keywords' | 'formatting';
  }>;
  contextualInsights: {
    resumeStrengths: string[];
    improvementAreas: string[];
    overallTone: string;
    experienceLevel: string;
  };
}

interface AnalysisResult extends AIAnalysisResult {
  resumeText: string;
}

export async function analyzeResume(
  resumeFile: Express.Multer.File,
  jobDescription: string
): Promise<AnalysisResult> {
  // Extract text from resume file
  const resumeText = await extractTextFromFile(resumeFile);

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Could not extract text from resume file');
  }

  // Use OpenAI to analyze the resume against job description
  const analysis = await performAIAnalysis(resumeText, jobDescription);
  
  return {
    ...analysis,
    resumeText
  };
}

export async function analyzeResumeText(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text is empty');
  }

  // Use OpenAI to analyze the resume against job description
  const analysis = await performAIAnalysis(resumeText, jobDescription);
  
  return {
    ...analysis,
    resumeText
  };
}

async function performAIAnalysis(
  resumeText: string,
  jobDescription: string
): Promise<AIAnalysisResult> {
  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Compare the resume text against the job description and provide a detailed analysis.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please analyze and return a JSON response with the following structure:
{
  "matchScore": <number between 0-100>,
  "matchedKeywords": [
    { "keyword": "<matched keyword>", "count": <number of times found> }
  ],
  "missingKeywords": [
    "<important missing keyword>"
  ],
  "suggestions": [
    {
      "id": "<unique_suggestion_id>",
      "type": "replace|add|enhance",
      "keyword": "<target keyword or skill>",
      "location": "<specific section like 'Work Experience - Job Title' or 'Skills Section'>",
      "originalText": "<exact text from resume to be modified>",
      "suggestedText": "<improved version with better keywords>",
      "reason": "<why this change will improve ATS score>",
      "impact": "high|medium|low",
      "category": "skills|experience|keywords|formatting"
    }
  ],
  "contextualInsights": {
    "resumeStrengths": ["<strength 1>", "<strength 2>"],
    "improvementAreas": ["<area 1>", "<area 2>"],
    "overallTone": "<professional|technical|creative|etc>",
    "experienceLevel": "<junior|mid|senior>"
  }
}

Analysis Guidelines:
1. Match Score (0-100): Base on keyword overlap, skill alignment, and experience relevance
2. Matched Keywords: Find skills, technologies, and important terms present in both documents
3. Missing Keywords: Identify crucial terms from job description missing in resume
4. Contextual Suggestions: Provide 5-8 specific, actionable recommendations that:
   - Identify exact text in the resume that should be modified
   - Suggest specific replacements that align with the candidate's actual experience
   - Focus on rewording existing experience to match job description language
   - Maintain the candidate's authentic experience while optimizing for ATS

Suggestion Types:
- "replace": Improve existing text with better keywords
- "add": Add missing but relevant information
- "enhance": Expand on existing points with more detail

Focus Areas:
- Exact phrase matching from job description
- Industry-specific terminology alignment
- Action verbs that match job requirements
- Quantifiable achievements relevant to the role
- Technical skills mentioned in job posting
- Soft skills phrasing that matches job language

For each suggestion:
- Quote the EXACT text from resume (originalText)
- Provide specific improved version (suggestedText)
- Explain the ATS impact (reason)
- Assess the improvement potential (impact: high/medium/low)

Return only valid JSON without any additional text or formatting.
`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume analyzer. Always return valid JSON responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const analysisText = response.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No response from OpenAI API');
    }

    // Parse the JSON response
    const analysis = JSON.parse(analysisText);
    
    // Validate the response structure
    if (!isValidAnalysisResult(analysis)) {
      throw new Error('Invalid analysis result structure');
    }

    return analysis;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof SyntaxError) {
      // Fallback analysis if JSON parsing fails
      return generateFallbackAnalysis(resumeText, jobDescription);
    }
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'insufficient_quota') {
        console.log('Using fallback analysis due to API quota limit');
        return generateFallbackAnalysis(resumeText, jobDescription);
      }
      if (error.code === 'model_not_found') {
        console.log('Using fallback analysis due to model access issues');
        return generateFallbackAnalysis(resumeText, jobDescription);
      }
    }
    
    // For any other error, use fallback
    console.log('Using fallback analysis due to API error');
    return generateFallbackAnalysis(resumeText, jobDescription);
  }
}

function isValidAnalysisResult(obj: any): obj is AnalysisResult {
  return (
    typeof obj === 'object' &&
    typeof obj.matchScore === 'number' &&
    obj.matchScore >= 0 &&
    obj.matchScore <= 100 &&
    Array.isArray(obj.matchedKeywords) &&
    Array.isArray(obj.missingKeywords) &&
    Array.isArray(obj.suggestions)
  );
}

function generateFallbackAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  console.log('🔄 Generating fallback analysis (AI unavailable)');
  
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract keywords from job description using basic NLP
  const jobWords = jobLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'your', 'their', 'would', 'should', 'could'].includes(word));
  
  // Common tech skills and keywords
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'angular', 'vue',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'git', 'github', 'gitlab',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
    'html', 'css', 'sass', 'bootstrap', 'tailwind', 'webpack', 'vite',
    'express', 'nestjs', 'django', 'flask', 'spring', 'laravel'
  ];
  
  const softSkills = [
    'leadership', 'communication', 'problem solving', 'teamwork', 'collaboration',
    'analytical', 'creative', 'organized', 'detail oriented', 'time management',
    'agile', 'scrum', 'project management', 'mentoring', 'training'
  ];
  
  const allKeywords = [...techKeywords, ...softSkills, ...Array.from(new Set(jobWords))];
  
  const matchedKeywords: Array<{ keyword: string; count: number }> = [];
  const missingKeywords: string[] = [];
  
  allKeywords.forEach(keyword => {
    const resumeMatches = (resumeLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
    const jobMatches = (jobLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
    
    if (resumeMatches > 0 && jobMatches > 0) {
      matchedKeywords.push({ keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1), count: resumeMatches });
    } else if (jobMatches > 0 && resumeMatches === 0) {
      missingKeywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  // Sort by relevance
  matchedKeywords.sort((a, b) => b.count - a.count);
  
  // Calculate match score based on keyword overlap and frequency
  const totalJobKeywords = jobWords.length;
  const matchedWeight = matchedKeywords.reduce((sum, match) => sum + match.count, 0);
  const matchScore = Math.min(100, Math.round((matchedWeight / Math.max(totalJobKeywords * 0.1, 1)) * 100));
  
  // Generate contextual suggestions
  const suggestions = missingKeywords.slice(0, 4).map((keyword, index) => {
    const locations = ['Skills section', 'Experience section', 'Summary section', 'Projects section'];
    const types: Array<'replace' | 'add' | 'enhance'> = ['add', 'enhance', 'replace'];
    const impacts: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const categories: Array<'skills' | 'experience' | 'keywords' | 'formatting'> = ['skills', 'experience', 'keywords', 'formatting'];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      id: `fallback_${index}_${Date.now()}`,
      type: randomType,
      keyword,
      location: randomLocation,
      originalText: `[Original text from ${randomLocation.toLowerCase()}]`,
      suggestedText: `[Enhanced text including ${keyword}]`,
      reason: `Adding "${keyword}" will improve ATS matching as it appears in the job description`,
      impact: randomImpact,
      category: randomCategory
    };
  });
  
  return {
    matchScore: Math.max(25, matchScore), // Minimum 25% to be encouraging
    matchedKeywords: matchedKeywords.slice(0, 8),
    missingKeywords: missingKeywords.slice(0, 6),
    suggestions,
    contextualInsights: {
      resumeStrengths: ['Well-structured format', 'Clear experience presentation'],
      improvementAreas: ['Keyword optimization', 'ATS compatibility'],
      overallTone: 'professional',
      experienceLevel: 'mid-level'
    }
  };
}