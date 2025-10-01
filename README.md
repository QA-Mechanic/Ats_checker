# ATS Resume Checker

An AI-powered ATS (Applicant Tracking System) resume analyzer that helps job seekers optimize their resumes for better keyword matching and ATS compatibility.

## Features

- 📄 **Resume Upload**: Support for PDF and DOCX file formats
- 🤖 **AI Analysis**: Powered by local AI server (gpt-4o) or OpenAI API
- 📊 **Match Score**: Get percentage compatibility with job descriptions
- 🔍 **Keyword Analysis**: Identify matched and missing keywords
- 💡 **Smart Suggestions**: Receive AI-powered recommendations for improvement
- 🎨 **Modern UI**: Clean, responsive design with dark/light mode support
- 🔄 **Fallback System**: Intelligent keyword matching when AI is unavailable

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Lucide React** for icons
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **OpenAI API** or local AI server integration
- **Multer** for file uploads
- **PDF.js** for PDF text extraction
- **Mammoth** for DOCX text extraction

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Local AI server running on port 4141 (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResumeRanker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # AI API Configuration
   OPENAI_BASE_URL=http://localhost:4141/v1  # Your local AI server
   OPENAI_API_KEY=dummy-key                  # API key for your AI server
   OPENAI_MODEL=gpt-4o                       # Model to use
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Session Configuration
   SESSION_SECRET=your-random-secret-string-here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Upload Resume**: Drag and drop or select a PDF/DOCX resume file
2. **Add Job Description**: Paste the job description text
3. **Analyze**: Click "Analyze Resume" to get AI-powered insights
4. **Review Results**: See match score, keywords, and improvement suggestions

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Resume analysis endpoint (accepts multipart/form-data)

## Configuration Options

### AI Server Setup
The application supports both local AI servers and OpenAI's cloud API:

- **Local AI Server**: Set `OPENAI_BASE_URL` to your local server
- **OpenAI API**: Use `https://api.openai.com/v1` as base URL

### Model Selection
Supported models:
- `gpt-4o` (recommended for local servers)
- `gpt-4`
- `gpt-3.5-turbo`

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── resume-analyzer.ts # AI analysis logic
│   └── text-extractor.ts  # File processing
├── shared/                # Shared TypeScript types
└── .env.example          # Environment variables template
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue in the repository.
