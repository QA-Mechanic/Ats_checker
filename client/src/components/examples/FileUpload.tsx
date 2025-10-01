import { useState } from "react"
import { FileUpload } from "../FileUpload"

export default function FileUploadExample() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="p-8">
      <FileUpload 
        onFileSelect={setFile} 
        selectedFile={file}
      />
    </div>
  )
}
