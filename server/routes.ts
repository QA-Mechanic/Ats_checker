import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { analyzeResume } from "./resume-analyzer";

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
    try {
      const { jobDescription } = req.body;
      const resumeFile = req.file;

      if (!resumeFile) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({ message: "Job description is required" });
      }

      if (jobDescription.length > 10000) {
        return res.status(400).json({ message: "Job description too long (max 10,000 characters)" });
      }

      const analysis = await analyzeResume(resumeFile, jobDescription);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
