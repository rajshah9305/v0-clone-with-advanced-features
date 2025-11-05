"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Key, Zap, Brain, Cpu, Cloud, Check, AlertCircle, Eye, EyeOff } from "lucide-react"

interface ApiProvider {
  id: string
  name: string
  icon: React.ReactNode
  models: string[]
  requiresApiKey: boolean
  status: "connected" | "disconnected" | "error"
  apiKey?: string
  baseUrl?: string
  description: string
}

interface ApiSettingsProps {
  onClose: () => void
}

export function ApiSettings({ onClose }: ApiSettingsProps) {
  const [providers, setProviders] = useState<ApiProvider[]>([
    {
      id: "cerebras",
      name: "Cerebras",
      icon: <Zap className="h-4 w-4" />,
      models: ["GPT-OSS-120B", "GPT-OSS-70B", "GPT-OSS-13B"],
      requiresApiKey: true,
      status: "connected",
      apiKey: "cs-••••••••••••••••••••••••••••••••",
      description: "Ultra-fast inference with Cerebras CS-2 systems",
    },
    {
      id: "openai",
      name: "OpenAI",
      icon: <Brain className="h-4 w-4" />,
      models: ["GPT-4", "GPT-4-turbo", "GPT-3.5-turbo"],
      requiresApiKey: true,
      status: "disconnected",
      description: "Advanced language models from OpenAI",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      icon: <Cpu className="h-4 w-4" />,
      models: ["Claude-3-Opus", "Claude-3-Sonnet", "Claude-3-Haiku"],
      requiresApiKey: true,
      status: "disconnected",
      description: "Constitutional AI models from Anthropic",
    },
    {
      id: "groq",
      name: "Groq",
      icon: <Zap className="h-4 w-4" />,
      models: ["Llama-3-70B", "Llama-3-8B", "Mixtral-8x7B"],
      requiresApiKey: true,
      status: "error",
      description: "Lightning-fast inference with Groq LPU systems",
    },
    {
      id: "together",
      name: "Together AI",
      icon: <Cloud className="h-4 w-4" />,
      models: ["Llama-2-70B", "CodeLlama-34B", "Mistral-7B"],
      requiresApiKey: true,
      status: "disconnected",
      description: "Open-source models with fast inference",
    },
  ])

  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [tempApiKey, setTempApiKey] = useState("")
  const [tempBaseUrl, setTempBaseUrl] = useState("")
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const handleEditProvider = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    if (provider) {
      setEditingProvider(providerId)
      setTempApiKey(provider.apiKey || "")
      setTempBaseUrl(provider.baseUrl || "")
    }
  }

  const handleSaveProvider = async (providerId: string) => {
    setTestingConnection(providerId)

    // Simulate API key validation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              apiKey: tempApiKey,
              baseUrl: tempBaseUrl,
              status: tempApiKey ? "connected" : "disconnected",
            }
          : provider,
      ),
    )

    setEditingProvider(null)
    setTempApiKey("")
    setTempBaseUrl("")
    setTestingConnection(null)
  }

  const handleCancelEdit = () => {
    setEditingProvider(null)
    setTempApiKey("")
    setTempBaseUrl("")
  }

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Check className="h-3 w-3 text-green-500" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-lg">API Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="space-y-4 mt-4">
              <div className="space-y-3">
                {providers.map((provider) => (
                  <Card key={provider.id} className="p-4">
                    <div className="space-y-3">
                      {/* Provider Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-xs text-muted-foreground">{provider.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(provider.status)}`}>
                            {getStatusIcon(provider.status)}
                            <span className="ml-1 capitalize">{provider.status}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* API Configuration */}
                      {editingProvider === provider.id ? (
                        <div className="space-y-3 pt-3 border-t border-border">
                          <div className="space-y-2">
                            <Label htmlFor={`apikey-${provider.id}`}>API Key</Label>
                            <Input
                              id={`apikey-${provider.id}`}
                              type="password"
                              value={tempApiKey}
                              onChange={(e) => setTempApiKey(e.target.value)}
                              placeholder="Enter your API key..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`baseurl-${provider.id}`}>Base URL (Optional)</Label>
                            <Input
                              id={`baseurl-${provider.id}`}
                              value={tempBaseUrl}
                              onChange={(e) => setTempBaseUrl(e.target.value)}
                              placeholder="https://api.example.com/v1"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveProvider(provider.id)}
                              disabled={testingConnection === provider.id}
                            >
                              {testingConnection === provider.id ? "Testing..." : "Save & Test"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Current Configuration */}
                          {provider.apiKey && (
                            <div className="flex items-center gap-2 text-sm">
                              <Key className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">API Key:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {showApiKey[provider.id] ? provider.apiKey : "••••••••••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleApiKeyVisibility(provider.id)}
                              >
                                {showApiKey[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          )}

                          {/* Models */}
                          <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Available Models:</span>
                            <div className="flex flex-wrap gap-1">
                              {provider.models.map((model) => (
                                <Badge key={model} variant="secondary" className="text-xs">
                                  {model}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProvider(provider.id)}>
                              {provider.apiKey ? "Edit" : "Configure"}
                            </Button>
                            {provider.status === "connected" && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Configure model-specific settings and preferences.</div>

                {providers
                  .filter((p) => p.status === "connected")
                  .map((provider) => (
                    <Card key={provider.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {provider.icon}
                          <h3 className="font-medium">{provider.name}</h3>
                        </div>

                        <div className="space-y-3">
                          {provider.models.map((model) => (
                            <div key={model} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{model}</div>
                                <div className="text-xs text-muted-foreground">
                                  {provider.id === "cerebras" && "Ultra-fast inference"}
                                  {provider.id === "openai" && "Advanced reasoning"}
                                  {provider.id === "anthropic" && "Constitutional AI"}
                                  {provider.id === "groq" && "Lightning speed"}
                                  {provider.id === "together" && "Open source"}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch defaultChecked={model.includes("120B") || model.includes("GPT-4")} />
                                <span className="text-xs text-muted-foreground">Enabled</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}

                {providers.filter((p) => p.status === "connected").length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="space-y-2">
                      <Key className="h-8 w-8 mx-auto text-muted-foreground" />
                      <h3 className="font-medium">No Connected Providers</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure API providers in the Providers tab to see available models.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
