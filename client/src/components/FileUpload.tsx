import { useState, useCallback } from "react"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  accept?: string
  maxSize?: number
}

export function FileUpload({ 
  onFileSelect, 
  selectedFile, 
  accept = ".pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''))
    
    if (!extension || !acceptedExtensions.includes(extension)) {
      return `Please upload a ${accept} file`
    }
    
    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    
    setError(null)
    onFileSelect(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [onFileSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const removeFile = () => {
    onFileSelect(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover-elevate",
            error && "border-destructive"
          )}
        >
          <input
            type="file"
            onChange={handleFileInput}
            accept={accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid="input-resume-file"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drop your resume here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF and DOCX files up to {maxSize / 1024 / 1024}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between hover-elevate">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium" data-testid="text-uploaded-filename">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            data-testid="button-remove-file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive" data-testid="text-file-error">{error}</p>
      )}
    </div>
  )
}
