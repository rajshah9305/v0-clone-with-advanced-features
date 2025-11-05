"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Download, Eye, Code, FileText, ImageIcon } from "lucide-react"

interface FilePreviewProps {
  file: File
  onClose: () => void
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const isImage = file.type.startsWith("image/")
  const isText = file.type.startsWith("text/") || file.name.match(/\.(md|json|csv|xml|yaml|yml)$/)
  const isCode = file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|html|css|json)$/)

  const handleViewContent = async () => {
    if (isText || isCode) {
      setIsLoading(true)
      try {
        const text = await file.text()
        setContent(text)
      } catch (error) {
        console.error("Error reading file:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDownload = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
            {isImage ? (
              <ImageIcon className="h-4 w-4" />
            ) : isCode ? (
              <Code className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{file.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <Badge variant="outline" className="text-xs">
                {file.type || "Unknown"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isText || isCode) && (
            <Button variant="outline" size="sm" onClick={handleViewContent} disabled={isLoading}>
              <Eye className="h-4 w-4 mr-2" />
              {isLoading ? "Loading..." : "View"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isImage && (
          <div className="flex justify-center">
            <img
              src={URL.createObjectURL(file) || "/placeholder.svg"}
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded"
            />
          </div>
        )}

        {content && (
          <ScrollArea className="h-96">
            <pre className="text-sm bg-muted p-4 rounded font-mono overflow-x-auto">
              <code>{content}</code>
            </pre>
          </ScrollArea>
        )}

        {!isImage && !content && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>File preview not available</p>
            <p className="text-sm">Click "View" to see text content or "Download" to save the file</p>
          </div>
        )}
      </div>
    </Card>
  )
}
