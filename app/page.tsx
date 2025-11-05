"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ChatHistory } from "@/components/chat-history"
import { ApiSettings } from "@/components/api-settings"
import { Button } from "@/components/ui/button"
import { IconMenu, IconSettings, IconPlus } from "@/components/icons"

export default function HomePage() {
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>("default")

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    setCurrentChatId(newChatId)
    setShowHistory(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-80 border-r border-border bg-sidebar">
          <ChatHistory
            currentChatId={currentChatId}
            onSelectChat={setCurrentChatId}
            onClose={() => setShowHistory(false)}
          />
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} className="md:hidden">
              <IconMenu />
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {/* Cerebras logo - circular design with gradient */}
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-full"></div>
                  <div className="absolute inset-1 bg-background rounded-full"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary/80 rounded-full"></div>
                </div>
                <span className="ml-2 font-semibold text-lg text-foreground">cerebras</span>
                <span className="ml-1 text-sm text-muted-foreground font-normal">inference</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleNewChat} className="hidden md:flex">
              <IconPlus />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <IconSettings />
            </Button>

            <div className="w-8 h-8 bg-foreground rounded-full" />
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 relative">
          <ChatInterface chatId={currentChatId} />

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-0 right-0 w-80 h-full bg-card border-l border-border shadow-lg">
              <ApiSettings onClose={() => setShowSettings(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
