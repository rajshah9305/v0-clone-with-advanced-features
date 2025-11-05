"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"
import { FileUpload } from "@/components/file-upload"
import { CodeArtifact } from "@/components/code-artifact"
import { ChatControls } from "@/components/chat-controls"
import { MessageActions } from "@/components/message-actions"
import { IconSend, IconPaperclip, IconChevronDown, IconMic, IconMicOff } from "@/components/icons"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  responseTime?: number
  tokensPerSecond?: number
  hasCode?: boolean
  files?: File[]
  artifact?: {
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
}

interface ChatSettings {
  temperature: number
  maxTokens: number
  systemPrompt: string
  enableStreaming: boolean
  enableCodeExecution: boolean
  enableWebSearch: boolean
}

interface ChatInterfaceProps {
  chatId: string
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Here's a complete Flask API example with authentication and CSV parsing capabilities:`,
      timestamp: new Date(),
      responseTime: 1.43,
      tokensPerSecond: 1707,
      hasCode: true,
      artifact: {
        title: "Flask API with Authentication",
        description: "A complete Flask application with JWT authentication and CSV parsing endpoints",
        files: [
          {
            name: "app.py",
            language: "python",
            content: `from flask import Flask, request, jsonify
import jwt
import pandas as pd
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    auth = request.get_json()
    if auth and auth['username'] == 'admin' and auth['password'] == 'password':
        token = jwt.encode({'user': auth['username']}, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/parse-csv', methods=['POST'])
@token_required
def parse_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    df = pd.read_csv(file)
    return jsonify(df.to_dict('records'))

if __name__ == '__main__':
    app.run(debug=True)`,
          },
          {
            name: "requirements.txt",
            content: `Flask==2.3.3
PyJWT==2.8.0
pandas==2.0.3`,
            language: "text",
          },
        ],
        isExecutable: true,
      },
    },
    {
      id: "2",
      role: "assistant",
      content: `(Windows).
— **Always verify indentation, line endings, and hidden characters after pasting.**

Happy coding! 🚀 If you run into a specific environment that isn't covered here, let me know and I'll dive into the details.`,
      timestamp: new Date(),
      responseTime: 1.43,
      tokensPerSecond: 1707,
      hasCode: true,
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("GPT-OSS-120B")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: "You are a helpful AI assistant that provides accurate and detailed responses.",
    enableStreaming: true,
    enableCodeExecution: false,
    enableWebSearch: false,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && uploadedFiles.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setUploadedFiles([])
    setIsLoading(true)

    // Simulate AI response with streaming if enabled
    if (chatSettings.enableStreaming) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        responseTime: 0,
        tokensPerSecond: 0,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Simulate streaming
      const fullResponse = `I understand you're asking about: "${input}". This is a simulated streaming response that demonstrates real-time text generation. The response includes detailed explanations and would normally come from the configured AI model using the current settings.`

      let currentContent = ""
      const words = fullResponse.split(" ")

      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))
        currentContent += (i > 0 ? " " : "") + words[i]

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? {
                  ...msg,
                  content: currentContent,
                  responseTime: (Date.now() - aiMessage.timestamp.getTime()) / 1000,
                  tokensPerSecond: Math.floor((i + 1) / ((Date.now() - aiMessage.timestamp.getTime()) / 1000)),
                }
              : msg,
          ),
        )
      }

      setIsLoading(false)
    } else {
      // Non-streaming response
      setTimeout(
        () => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I understand you're asking about: "${input}". This is a simulated response that would normally come from the AI model. The response includes code examples and detailed explanations based on your current settings.`,
            timestamp: new Date(),
            responseTime: Math.random() * 2 + 0.5,
            tokensPerSecond: Math.floor(Math.random() * 1000 + 1200),
            hasCode: Math.random() > 0.5,
          }
          setMessages((prev) => [...prev, aiMessage])
          setIsLoading(false)
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVoiceInput = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setInput("This is a simulated voice input transcription.")
      }, 3000)
    } else {
      // Stop recording
      setIsRecording(false)
    }
  }

  const handleRegenerate = (messageId: string) => {
    // Find the message and regenerate response
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1]
      // Simulate regeneration
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === messageIndex
            ? {
                ...msg,
                content: `Regenerated response: ${msg.content}`,
                responseTime: Math.random() * 2 + 0.5,
                tokensPerSecond: Math.floor(Math.random() * 1000 + 1200),
              }
            : msg,
        ),
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2 group">
            {message.role === "user" ? (
              <div className="flex justify-end">
                <Card className="max-w-[80%] p-4 bg-muted relative">
                  <p className="text-sm">{message.content}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <MessageActions
                    messageId={message.id}
                    content={message.content}
                    onEdit={(newContent) => {
                      setMessages((prev) =>
                        prev.map((msg) => (msg.id === message.id ? { ...msg, content: newContent } : msg)),
                      )
                    }}
                  />
                </Card>
              </div>
            ) : (
              <div className="space-y-3">
                {message.responseTime && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 text-primary">
                      <div className="w-3 h-3 text-primary">⚡</div>
                      <span className="font-medium text-primary">RESPONDED IN {message.responseTime.toFixed(2)}S</span>
                      <span className="text-muted-foreground">({message.tokensPerSecond} TOKENS/SEC)</span>
                    </div>
                    <IconChevronDown />
                  </div>
                )}

                <Card className="p-4 bg-card relative">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Short answer:</h3>
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {message.artifact && (
                      <div className="mt-4">
                        <CodeArtifact {...message.artifact} />
                      </div>
                    )}

                    {message.hasCode && !message.artifact && <CodeBlock code={message.content} language="text" />}
                  </div>

                  <MessageActions
                    messageId={message.id}
                    content={message.content}
                    onRegenerate={() => handleRegenerate(message.id)}
                    onRate={(rating) => console.log(`Rated ${message.id} as ${rating}`)}
                  />
                </Card>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4 bg-card">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeFile(index)}
              >
                {file.name} ×
              </Badge>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Generate a Flask API, parse a CSV, explain inference..."
              className="min-h-[60px] pr-32 resize-none"
              disabled={isLoading}
            />

            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isRecording ? "text-red-500 bg-red-50" : ""}`}
                onClick={handleVoiceInput}
              >
                {isRecording ? <IconMicOff /> : <IconMic />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowFileUpload(!showFileUpload)}
              >
                <IconPaperclip />
              </Button>

              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
              >
                <IconSend />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 text-primary">⚡</div>
                <span className="text-primary font-medium">POWERED BY</span>
                <span className="text-primary font-bold">CEREBRAS</span>
              </span>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="GPT-OSS-120B">GPT-OSS-120B</option>
                <option value="GPT-OSS-70B">GPT-OSS-70B</option>
                <option value="GPT-OSS-13B">GPT-OSS-13B</option>
              </select>

              <ChatControls onSettingsChange={setChatSettings} />
            </div>
          </div>
        </form>

        {showFileUpload && (
          <div className="mt-3">
            <FileUpload onUpload={handleFileUpload} />
          </div>
        )}
      </div>
    </div>
  )
}
