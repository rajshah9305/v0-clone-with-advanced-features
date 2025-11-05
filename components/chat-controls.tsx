"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings2, Thermometer, Hash, MessageSquare, Zap, Brain, Sparkles } from "lucide-react"

interface ChatControlsProps {
  onSettingsChange: (settings: ChatSettings) => void
}

interface ChatSettings {
  temperature: number
  maxTokens: number
  systemPrompt: string
  enableStreaming: boolean
  enableCodeExecution: boolean
  enableWebSearch: boolean
}

export function ChatControls({ onSettingsChange }: ChatControlsProps) {
  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: "You are a helpful AI assistant that provides accurate and detailed responses.",
    enableStreaming: true,
    enableCodeExecution: false,
    enableWebSearch: false,
  })

  const [isOpen, setIsOpen] = useState(false)

  const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const presetPrompts = [
    {
      name: "Code Assistant",
      prompt: "You are an expert software developer. Provide clean, well-documented code with explanations.",
      icon: <Brain className="h-3 w-3" />,
    },
    {
      name: "Creative Writer",
      prompt:
        "You are a creative writing assistant. Help with storytelling, character development, and narrative structure.",
      icon: <Sparkles className="h-3 w-3" />,
    },
    {
      name: "Technical Analyst",
      prompt: "You are a technical analyst. Provide detailed, data-driven insights and explanations.",
      icon: <Zap className="h-3 w-3" />,
    },
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings2 className="h-4 w-4" />
          Chat Settings
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Chat Configuration</h4>
            <p className="text-sm text-muted-foreground">Customize the AI behavior and response style.</p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-3 w-3" />
                Temperature
              </Label>
              <Badge variant="secondary" className="text-xs">
                {settings.temperature}
              </Badge>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => updateSetting("temperature", value)}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness. Lower = more focused, Higher = more creative
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Max Tokens
              </Label>
              <Badge variant="secondary" className="text-xs">
                {settings.maxTokens}
              </Badge>
            </div>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([value]) => updateSetting("maxTokens", value)}
              max={4000}
              min={100}
              step={100}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum length of the response</p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3" />
              System Prompt
            </Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => updateSetting("systemPrompt", e.target.value)}
              placeholder="Enter system prompt..."
              className="min-h-[80px] text-xs"
            />

            {/* Preset Prompts */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quick presets:</p>
              <div className="flex flex-wrap gap-1">
                {presetPrompts.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-transparent"
                    onClick={() => updateSetting("systemPrompt", preset.prompt)}
                  >
                    {preset.icon}
                    <span className="ml-1">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Features</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Streaming Responses</Label>
                <p className="text-xs text-muted-foreground">Show responses as they're generated</p>
              </div>
              <Switch
                checked={settings.enableStreaming}
                onCheckedChange={(checked) => updateSetting("enableStreaming", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Code Execution</Label>
                <p className="text-xs text-muted-foreground">Allow running generated code</p>
              </div>
              <Switch
                checked={settings.enableCodeExecution}
                onCheckedChange={(checked) => updateSetting("enableCodeExecution", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Web Search</Label>
                <p className="text-xs text-muted-foreground">Enable real-time web search</p>
              </div>
              <Switch
                checked={settings.enableWebSearch}
                onCheckedChange={(checked) => updateSetting("enableWebSearch", checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
