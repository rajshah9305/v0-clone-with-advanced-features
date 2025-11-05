"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { IconUpload, IconFile, IconImage, IconCode, IconX, IconCheck, IconAlertCircle } from "@/components/icons"

interface FileWithPreview extends File {
  preview?: string
  id: string
  uploadProgress?: number
  uploadStatus?: "uploading" | "success" | "error"
  error?: string
}

interface FileUploadProps {
  onUpload: (files: File[]) => void
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((droppedFiles: File[]) => {
    const newFiles: FileWithPreview[] = droppedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        id: `${file.name}-${Date.now()}`,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        uploadProgress: 0,
        uploadStatus: "uploading" as const,
      })
      return fileWithPreview
    })

    setFiles((prev) => [...prev, ...newFiles])
    newFiles.forEach((file, index) => {
      simulateUpload(file, index)
    })
  }, [])

  const simulateUpload = (file: FileWithPreview, index: number) => {
    let progress = 0
    const interval = setInterval(
      () => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: 100, uploadStatus: "success" } : f)),
          )
        } else {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress } : f)))
        }
      },
      200 + index * 100,
    )
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  const handleUploadComplete = () => {
    const successfulFiles = files.filter((f) => f.uploadStatus === "success")
    onUpload(successfulFiles)
    setFiles([])
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <IconImage />
    if (file.type.startsWith("text/") || file.name.endsWith(".md")) return <IconFile />
    if (file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|html|css|json)$/)) return <IconCode />
    return <IconFile />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isValidFile = (file: File) => {
    const validExtensions = [
      "txt",
      "md",
      "json",
      "csv",
      "xml",
      "yaml",
      "yml",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "svg",
      "webp",
      "mp4",
      "avi",
      "mov",
      "wmv",
      "mp3",
      "wav",
      "ogg",
      "zip",
      "rar",
    ]
    const ext = file.name.split(".").pop()?.toLowerCase()
    const maxSize = 10 * 1024 * 1024
    return ext && validExtensions.includes(ext) && file.size <= maxSize
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isValidFile)
    if (droppedFiles.length > 0) {
      onDrop(droppedFiles)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(isValidFile)
      if (selectedFiles.length > 0) {
        onDrop(selectedFiles)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed cursor-pointer transition-all duration-200 ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`p-3 rounded-full transition-colors ${isDragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <IconUpload />
          </div>
          <div className="space-y-1">
            {isDragActive ? (
              <p className="text-primary font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">Supports images, documents, and code files (max 10MB)</p>
              </div>
            )}
          </div>
          <input
            type="file"
            multiple
            onChange={handleInputChange}
            accept=".txt,.md,.json,.csv,.xml,.yaml,.yml,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.svg,.webp,.mp4,.avi,.mov,.wmv,.mp3,.wav,.ogg,.zip,.rar"
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              Select Files
            </Button>
          </label>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
            {files.some((f) => f.uploadStatus === "success") && (
              <Button size="sm" onClick={handleUploadComplete} className="text-xs">
                Add to Chat
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.id)}>
                        <IconX />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {file.type || "Unknown"}
                      </Badge>
                    </div>
                    {file.uploadStatus === "uploading" && (
                      <div className="space-y-1">
                        <Progress value={file.uploadProgress || 0} className="h-1" />
                        <p className="text-xs text-muted-foreground">
                          Uploading... {Math.round(file.uploadProgress || 0)}%
                        </p>
                      </div>
                    )}
                    {file.uploadStatus === "success" && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <IconCheck />
                        <span>Upload complete</span>
                      </div>
                    )}
                    {file.uploadStatus === "error" && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <IconAlertCircle />
                        <span>{file.error || "Upload failed"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
