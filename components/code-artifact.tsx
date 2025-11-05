"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { Play, Square, RefreshCw, ExternalLink, Download } from "lucide-react"

interface CodeArtifactProps {
  title: string
  description?: string
  files: Array<{
    name: string
    content: string
    language: string
  }>
  previewUrl?: string
  isExecutable?: boolean
}

export function CodeArtifact({ title, description, files, previewUrl, isExecutable = false }: CodeArtifactProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string>("")
  const [activeTab, setActiveTab] = useState(files[0]?.name || "preview")

  const handleExecute = async () => {
    setIsRunning(true)
    setOutput("Executing code...\n")

    // Simulate code execution
    setTimeout(() => {
      setOutput((prev) => prev + "✓ Code executed successfully\n")
      setOutput((prev) => prev + "Output: Hello, World!\n")
      setOutput((prev) => prev + "Process completed in 1.23s\n")
      setIsRunning(false)
    }, 2000)
  }

  const handleStop = () => {
    setIsRunning(false)
    setOutput((prev) => prev + "\n⚠ Execution stopped by user\n")
  }

  const handleDownloadProject = () => {
    // Create a zip-like structure (simplified for demo)
    const projectData = files.map((file) => `// ${file.name}\n${file.content}`).join("\n\n---\n\n")
    const blob = new Blob([projectData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-project.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {isExecutable && (
            <>
              {isRunning ? (
                <Button variant="outline" size="sm" onClick={handleStop}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleExecute}>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              )}
            </>
          )}

          {previewUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleDownloadProject}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-auto">
            {previewUrl && (
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Preview
              </TabsTrigger>
            )}
            {files.map((file) => (
              <TabsTrigger key={file.name} value={file.name} className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {file.language}
                </Badge>
                {file.name}
              </TabsTrigger>
            ))}
            {isExecutable && (
              <TabsTrigger value="output" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Output
              </TabsTrigger>
            )}
          </TabsList>

          {/* Preview Tab */}
          {previewUrl && (
            <TabsContent value="preview" className="mt-4">
              <Card className="p-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <iframe src={previewUrl} className="w-full h-full rounded-lg border" title={`${title} Preview`} />
                </div>
              </Card>
            </TabsContent>
          )}

          {/* File Tabs */}
          {files.map((file) => (
            <TabsContent key={file.name} value={file.name} className="mt-4">
              <CodeBlock
                code={file.content}
                language={file.language}
                filename={file.name}
                isExecutable={isExecutable}
                onExecute={handleExecute}
              />
            </TabsContent>
          ))}

          {/* Output Tab */}
          {isExecutable && (
            <TabsContent value="output" className="mt-4">
              <Card className="bg-gray-900 text-gray-100">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs px-2 py-1 bg-blue-600 text-white">OUTPUT</Badge>
                    {isRunning && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-gray-300">Running...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 font-mono text-sm min-h-[200px]">
                  <pre className="whitespace-pre-wrap">
                    {output || "No output yet. Click 'Run' to execute the code."}
                  </pre>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Card>
  )
}
