import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeResume, analyzeResumeText } from "./resume-analyzer.js";
import { extractTextFromFile } from "./text-extractor.js";
import { createServer } from "http";

const upload = multer({ dest: "uploads/" });

export function registerRoutes(app: express.Application) {
  // Middleware is already set up in index.ts, so we don't need to duplicate it here

  // Upload and analyze resume
  app.post("/api/upload", upload.single("resume"), async (req, res) => {
    console.log('[UPLOAD] Starting file upload process...');
    try {
      if (!req.file) {
        console.log('[UPLOAD] No file provided');
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('[UPLOAD] File received:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      const jobDescription = req.body.jobDescription;
      console.log('[UPLOAD] Job description length:', jobDescription?.length || 0);

      if (!jobDescription) {
        console.log('[UPLOAD] No job description provided');
        return res.status(400).json({ message: "Job description is required" });
      }

      console.log('[UPLOAD] Extracting text from file...');
      const resumeText = await extractTextFromFile(req.file);
      console.log('[UPLOAD] Text extraction completed. Length:', resumeText.length);

      console.log('[UPLOAD] Starting resume analysis...');
      const analysis = await analyzeResume(req.file, jobDescription);
      console.log('[UPLOAD] Analysis completed successfully:', {
        matchScore: analysis.matchScore,
        suggestionsCount: analysis.suggestions.length,
        matchedKeywords: analysis.matchedKeywords.length
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
        console.log('[UPLOAD] Cleaned up temporary file');
      } catch (cleanupError) {
        console.error('[UPLOAD] Failed to cleanup file:', cleanupError);
      }

      res.json({
        ...analysis,
        resumeText
      });
    } catch (error) {
      console.error('[UPLOAD] Upload and analysis error:', error);
      // Clean up file on error
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('[UPLOAD] Failed to cleanup file on error:', cleanupError);
        }
      }
      res.status(500).json({ message: "Failed to process resume" });
    }
  });

  // Apply suggestion to resume
  app.post("/api/apply-suggestion", async (req, res) => {
    console.log('[APPLY-SUGGESTION] Starting suggestion application...');
    try {
      const { resumeText, suggestion } = req.body;
      
      console.log('[APPLY-SUGGESTION] Request data:', {
        resumeTextLength: resumeText?.length,
        suggestionId: suggestion?.id,
        suggestionType: suggestion?.type
      });

      if (!resumeText || !suggestion) {
        console.log('[APPLY-SUGGESTION] Missing required data');
        return res.status(400).json({ message: "Resume text and suggestion are required" });
      }

      console.log('[APPLY-SUGGESTION] Applying suggestion...');
      
      // Apply the suggestion to the resume text inline
      let updatedResumeText = resumeText;
      if (suggestion.type === 'replace' && suggestion.originalText) {
        updatedResumeText = resumeText.replace(suggestion.originalText, suggestion.suggestedText);
      } else if (suggestion.type === 'add') {
        // For adding, we'll append to the relevant section
        updatedResumeText = resumeText + '\n' + suggestion.suggestedText;
      } else if (suggestion.type === 'enhance') {
        // For enhancing, replace if original text exists, otherwise append
        if (suggestion.originalText && resumeText.includes(suggestion.originalText)) {
          updatedResumeText = resumeText.replace(suggestion.originalText, suggestion.suggestedText);
        } else {
          updatedResumeText = resumeText + '\n' + suggestion.suggestedText;
        }
      }
      
      console.log('[APPLY-SUGGESTION] Suggestion applied successfully:', {
        suggestionId: suggestion.id,
        suggestionType: suggestion.type,
        textChanged: updatedResumeText !== resumeText,
        newLength: updatedResumeText.length
      });

      res.json({ 
        updatedResume: updatedResumeText,
        appliedSuggestion: suggestion
      });
    } catch (error) {
      console.error('[APPLY-SUGGESTION] Apply suggestion error:', error);
      res.status(500).json({ message: "Failed to apply suggestion" });
    }
  });

  // Regenerate suggestions
  app.post("/api/regenerate-suggestions", async (req, res) => {
    console.log('[REGENERATE] Starting suggestion regeneration...');
    try {
      const { resumeText, jobDescription, preferences } = req.body;
      
      console.log('[REGENERATE] Request data:', {
        resumeTextLength: resumeText?.length,
        jobDescriptionLength: jobDescription?.length,
        preferences: preferences || 'none'
      });

      if (!resumeText || !jobDescription) {
        console.log('[REGENERATE] Missing required data');
        return res.status(400).json({ message: "Resume text and job description are required" });
      }

      console.log('[REGENERATE] Regenerating suggestions...');
      
      const analysis = await analyzeResumeText(resumeText, jobDescription);
      
      // Filter suggestions based on preferences if provided
      let suggestions = analysis.suggestions;
      if (preferences) {
        if (preferences.focus) {
          suggestions = suggestions.filter((s: any) => s.category === preferences.focus);
        }
        if (preferences.impact) {
          suggestions = suggestions.filter((s: any) => s.impact === preferences.impact);
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

  // Re-analyze resume with updated text
  app.post("/api/re-analyze", async (req, res) => {
    console.log('[RE-ANALYZE] Starting re-analysis...');
    try {
      const { resumeText, jobDescription } = req.body;
      
      console.log('[RE-ANALYZE] Request data:', {
        resumeTextLength: resumeText?.length,
        jobDescriptionLength: jobDescription?.length
      });

      if (!resumeText || !jobDescription) {
        console.log('[RE-ANALYZE] Missing required data');
        return res.status(400).json({ message: "Resume text and job description are required" });
      }

      console.log('[RE-ANALYZE] Starting analysis...');
      const analysis = await analyzeResumeText(resumeText, jobDescription);
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

  // Download updated resume as PDF
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

      // Dynamic import for html-pdf-node
      const htmlPdf = await import('html-pdf-node') as any;
      
      // Generate HTML content with better styling
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
            ul, ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            li {
              margin-bottom: 5px;
            }
            strong {
              color: #2c3e50;
            }
          </style>
        </head>
        <body>
          <div class="resume-content">${resumeText.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `;

      const options = {
        format: 'A4',
        border: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm"
        }
      };

      console.log('[DOWNLOAD-PDF] Generating PDF...');
      const file = { content: html };
      const pdfBuffer = await htmlPdf.default.generatePdf(file, options);
      
      console.log('[DOWNLOAD-PDF] PDF generated successfully');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'improved_resume'}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('[DOWNLOAD-PDF] PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Download updated resume as DOCX
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

      // Dynamic import for docx
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      // Parse resume text into paragraphs
      const paragraphs = resumeText.split('\n').map((line: string) => {
        if (line.trim() === '') {
          return new Paragraph({});
        }
        
        // Check if line looks like a header (all caps, short, etc.)
        const isHeader = line.trim().length < 50 && (
          line === line.toUpperCase() || 
          line.includes('EXPERIENCE') || 
          line.includes('EDUCATION') ||
          line.includes('SKILLS') ||
          line.includes('SUMMARY') ||
          line.includes('CONTACT')
        );
        
        return new Paragraph({
          children: [
            new TextRun({
              text: line,
              bold: isHeader,
              size: isHeader ? 28 : 24,
            })
          ]
        });
      });

      console.log('[DOWNLOAD-DOCX] Creating document...');
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs
          }
        ]
      });

      console.log('[DOWNLOAD-DOCX] Generating DOCX buffer...');
      const buffer = await Packer.toBuffer(doc);
      
      console.log('[DOWNLOAD-DOCX] DOCX generated successfully');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'improved_resume'}.docx"`);
      res.send(buffer);
    } catch (error) {
      console.error('[DOWNLOAD-DOCX] DOCX generation error:', error);
      res.status(500).json({ message: "Failed to generate DOCX", error: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}