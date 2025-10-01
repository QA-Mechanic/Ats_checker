import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { analyzeResume, analyzeResumeText } from "./resume-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOCX files are allowed'));
      }
    },
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Resume analysis endpoint
  app.post("/api/analyze", upload.single('resume'), async (req, res) => {
    console.log('[ANALYZE] Starting resume analysis...');
    try {
      const { jobDescription } = req.body;
      const resumeFile = req.file;
      
      console.log('[ANALYZE] File received:', {
        filename: resumeFile?.originalname,
        mimetype: resumeFile?.mimetype,
        size: resumeFile?.size,
        jobDescLength: jobDescription?.length
      });

      if (!resumeFile) {
        console.log('[ANALYZE] Missing resume file');
        return res.status(400).json({ message: "Resume file is required" });
      }

      if (!jobDescription || jobDescription.trim().length === 0) {
        console.log('[ANALYZE] Missing job description');
        return res.status(400).json({ message: "Job description is required" });
      }

      if (jobDescription.length > 10000) {
        console.log('[ANALYZE] Job description too long:', jobDescription.length);
        return res.status(400).json({ message: "Job description too long (max 10,000 characters)" });
      }

      const analysis = await analyzeResume(resumeFile, jobDescription);
      
      console.log('[ANALYZE] Analysis completed successfully:', {
        matchScore: analysis.matchScore,
        suggestionsCount: analysis.suggestions.length,
        matchedKeywords: analysis.matchedKeywords.length,
        resumeTextLength: analysis.resumeText.length
      });
      
      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('OpenAI')) {
          return res.status(503).json({ message: "AI service temporarily unavailable" });
        }
        if (error.message.includes('file format')) {
          return res.status(400).json({ message: error.message });
        }
      }
      
      res.status(500).json({ message: "Analysis failed. Please try again." });
    }
  });

  // Regenerate suggestions endpoint
  app.post("/api/regenerate-suggestions", async (req, res) => {
    console.log('[REGENERATE] Starting suggestion regeneration...');
    try {
      const { resumeText, jobDescription, preferences } = req.body;
      
      console.log('[REGENERATE] Request data:', {
        resumeTextLength: resumeText?.length,
        jobDescLength: jobDescription?.length,
        preferences
      });

      if (!resumeText || !jobDescription) {
        console.log('[REGENERATE] Missing required fields');
        return res.status(400).json({ message: "Resume text and job description are required" });
      }

      const analysis = await analyzeResumeText(resumeText, jobDescription);
      
      // Filter suggestions based on preferences if provided
      let suggestions = analysis.suggestions;
      if (preferences) {
        if (preferences.focus) {
          suggestions = suggestions.filter(s => s.category === preferences.focus);
        }
        if (preferences.impact) {
          suggestions = suggestions.filter(s => s.impact === preferences.impact);
        }
      }

      console.log('[REGENERATE] Regeneration completed successfully:', {
        originalSuggestions: analysis.suggestions.length,
        filteredSuggestions: suggestions.length,
        preferences
      });

      res.json({ suggestions, contextualInsights: analysis.contextualInsights });
    } catch (error) {
      console.error('[REGENERATE] Regenerate suggestions error:', error);
      res.status(500).json({ message: "Failed to regenerate suggestions" });
    }
  });

  // Apply suggestion to resume endpoint
  app.post("/api/apply-suggestion", async (req, res) => {
    console.log('[APPLY] Applying suggestion...');
    try {
      const { resumeText, suggestion } = req.body;
      
      console.log('[APPLY] Suggestion data:', {
        suggestionId: suggestion?.id,
        suggestionType: suggestion?.type,
        resumeTextLength: resumeText?.length
      });

      if (!resumeText || !suggestion) {
        console.log('[APPLY] Missing required fields');
        return res.status(400).json({ message: "Resume text and suggestion are required" });
      }

      // Apply the suggestion to the resume text
      let updatedResume = resumeText;
      if (suggestion.type === 'replace' && suggestion.originalText) {
        updatedResume = resumeText.replace(suggestion.originalText, suggestion.suggestedText);
      } else if (suggestion.type === 'add') {
        // For adding, we'll append to the relevant section
        updatedResume = resumeText + '\n' + suggestion.suggestedText;
      } else if (suggestion.type === 'enhance') {
        // For enhancing, replace if original text exists, otherwise append
        if (suggestion.originalText && resumeText.includes(suggestion.originalText)) {
          updatedResume = resumeText.replace(suggestion.originalText, suggestion.suggestedText);
        } else {
          updatedResume = resumeText + '\n' + suggestion.suggestedText;
        }
      }

      console.log('[APPLY] Suggestion applied successfully:', {
        suggestionId: suggestion.id,
        suggestionType: suggestion.type,
        textChanged: updatedResume !== resumeText,
        newLength: updatedResume.length
      });

      res.json({ 
        updatedResume,
        appliedSuggestion: suggestion
      });
    } catch (error) {
      console.error('[APPLY] Apply suggestion error:', error);
      res.status(500).json({ message: "Failed to apply suggestion" });
    }
  });

  // Re-analyze updated resume endpoint
  app.post("/api/re-analyze", async (req, res) => {
    console.log('[RE-ANALYZE] Starting re-analysis...');
    try {
      const { updatedResumeText, jobDescription } = req.body;
      
      console.log('[RE-ANALYZE] Request data:', {
        updatedResumeTextLength: updatedResumeText?.length,
        jobDescLength: jobDescription?.length
      });

      if (!updatedResumeText || !jobDescription) {
        console.log('[RE-ANALYZE] Missing required fields');
        return res.status(400).json({ message: "Updated resume text and job description are required" });
      }

      const analysis = await analyzeResumeText(updatedResumeText, jobDescription);
      
      console.log('[RE-ANALYZE] Re-analysis completed successfully:', {
        matchScore: analysis.matchScore,
        suggestionsCount: analysis.suggestions.length,
        matchedKeywords: analysis.matchedKeywords.length
      });
      
      res.json(analysis);
    } catch (error) {
      console.error('[RE-ANALYZE] Re-analysis error:', error);
      res.status(500).json({ message: "Failed to re-analyze resume" });
    }
  });

  // Download updated resume as PDF (HTML format for now)
  app.post("/api/download/pdf", async (req, res) => {
    console.log('[DOWNLOAD-PDF] Starting PDF generation...');
    try {
      const { resumeText, fileName } = req.body;
      
      console.log('[DOWNLOAD-PDF] Request data:', {
        resumeTextLength: resumeText?.length,
        fileName: fileName || 'resume'
      });

      if (!resumeText) {
        console.log('[DOWNLOAD-PDF] Missing resume text');
        return res.status(400).json({ message: "Resume text is required" });
      }

      // Create professional HTML that can be printed as PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              font-size: 14px;
              margin: 0;
              padding: 0;
            }
            h1 { 
              color: #2c3e50; 
              font-size: 24px; 
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
              margin-bottom: 20px;
              margin-top: 0;
            }
            h2 { 
              color: #34495e; 
              font-size: 18px; 
              margin-top: 25px;
              margin-bottom: 15px;
            }
            h3 { 
              color: #555; 
              font-size: 16px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .resume-content { 
              white-space: pre-line;
              line-height: 1.8;
            }
            .section {
              margin-bottom: 20px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </head>
        <body>
          <div class="no-print" style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; text-align: center;">
            <strong>Resume - Ready for Print/Save as PDF</strong><br>
            Use Ctrl+P (Windows) or Cmd+P (Mac) to print or save as PDF
          </div>
          <div class="resume-content">${resumeText.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `;
      
      console.log('[DOWNLOAD-PDF] HTML generated successfully');

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'improved_resume'}.html"`);
      res.send(html);
    } catch (error) {
      console.error('[DOWNLOAD-PDF] PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Download updated resume as DOCX (Rich Text Format for now)
  app.post("/api/download/docx", async (req, res) => {
    console.log('[DOWNLOAD-DOCX] Starting DOCX generation...');
    try {
      const { resumeText, fileName } = req.body;
      
      console.log('[DOWNLOAD-DOCX] Request data:', {
        resumeTextLength: resumeText?.length,
        fileName: fileName || 'resume'
      });

      if (!resumeText) {
        console.log('[DOWNLOAD-DOCX] Missing resume text');
        return res.status(400).json({ message: "Resume text is required" });
      }

      // Create RTF format that can be opened by Word
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${resumeText.replace(/\n/g, '\\par ')}
}`;
      
      console.log('[DOWNLOAD-DOCX] RTF generated successfully');

      res.setHeader('Content-Type', 'application/rtf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'improved_resume'}.rtf"`);
      res.send(rtfContent);
    } catch (error) {
      console.error('[DOWNLOAD-DOCX] DOCX generation error:', error);
      res.status(500).json({ message: "Failed to generate DOCX" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
