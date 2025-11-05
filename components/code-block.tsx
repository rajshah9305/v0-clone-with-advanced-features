"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { IconCopy, IconCheck, IconPlay, IconDownload, IconMaximize, IconEye } from "@/components/icons"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  isExecutable?: boolean
  onExecute?: () => void
}

export function CodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  isExecutable = false,
  onExecute,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || `code.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
      xml: "xml",
      yaml: "yml",
      markdown: "md",
      sql: "sql",
      bash: "sh",
      shell: "sh",
    }
    return extensions[lang] || "txt"
  }

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      java: "bg-orange-500",
      cpp: "bg-purple-500",
      c: "bg-gray-500",
      html: "bg-red-500",
      css: "bg-blue-400",
      json: "bg-gray-600",
      xml: "bg-orange-400",
      yaml: "bg-purple-400",
      markdown: "bg-gray-700",
      sql: "bg-indigo-500",
      bash: "bg-green-600",
      shell: "bg-green-600",
    }
    return colors[lang] || "bg-gray-500"
  }

  // Enhanced syntax highlighting
  const highlightCode = (text: string, lang: string) => {
    let highlighted = text

    // Common patterns across languages
    highlighted = highlighted
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-400">$1</span>')
      // Strings
      .replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
      // Comments
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
      // Keywords based on language
      .replace(
        /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g,
        '<span class="text-purple-400 font-semibold">$1</span>',
      )

    // Language-specific highlighting
    if (lang === "python") {
      highlighted = highlighted
        .replace(
          /\b(def|class|import|from|if|elif|else|for|while|return|try|except|with|as)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>',
        )
        .replace(/\b(True|False|None)\b/g, '<span class="text-orange-400">$1</span>')
    } else if (lang === "javascript" || lang === "typescript") {
      highlighted = highlighted
        .replace(
          /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>',
        )
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
    }

    return highlighted
  }

  const lines = code.split("\n")
  const maxHeight = isExpanded ? "none" : "400px"

  return (
    <Card className="overflow-hidden bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {language && (
            <Badge className={`text-xs px-2 py-1 text-white ${getLanguageColor(language)}`}>
              {language.toUpperCase()}
            </Badge>
          )}
          {filename && <span className="text-sm text-gray-300">{filename}</span>}
        </div>

        <div className="flex items-center gap-1">
          {isExecutable && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-white" onClick={onExecute}>
              <IconPlay />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <IconEye /> : <IconMaximize />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white"
            onClick={handleDownload}
          >
            <IconDownload />
          </Button>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-300 hover:text-white" onClick={handleCopy}>
            {copied ? <IconCheck className="text-green-400" /> : <IconCopy />}
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative" style={{ maxHeight }}>
        <div className="overflow-auto">
          <div className="p-4 font-mono text-sm">
            {lines.map((line, index) => (
              <div key={index} className="flex min-h-[1.25rem]">
                {showLineNumbers && (
                  <span className="text-gray-500 mr-4 select-none min-w-[3rem] text-right flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(line || " ", language),
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Expand/Collapse overlay */}
        {!isExpanded && lines.length > 20 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)} className="text-xs">
              Show {lines.length - 20} more lines
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
