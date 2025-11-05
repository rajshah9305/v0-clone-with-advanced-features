"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Search, MessageSquare, Trash2, Edit3, Plus } from "lucide-react"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  model: string
}

interface ChatHistoryProps {
  currentChatId: string
  onSelectChat: (chatId: string) => void
  onClose: () => void
}

export function ChatHistory({ currentChatId, onSelectChat, onClose }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "default",
      title: "Cerebras chat UI has chat history?",
      lastMessage: "Yes — the Cerebras Chat UI keeps a session-level chat history...",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 4,
      model: "GPT-OSS-120B",
    },
    {
      id: "chat-2",
      title: "Flask API development",
      lastMessage: "Here's how to create a Flask API with authentication...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 12,
      model: "GPT-OSS-70B",
    },
    {
      id: "chat-3",
      title: "CSV parsing with pandas",
      lastMessage: "You can use pandas.read_csv() to parse CSV files efficiently...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 8,
      model: "GPT-OSS-120B",
    },
    {
      id: "chat-4",
      title: "Machine learning inference optimization",
      lastMessage: "For optimizing inference speed, consider these approaches...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      messageCount: 15,
      model: "GPT-OSS-120B",
    },
    {
      id: "chat-5",
      title: "React component architecture",
      lastMessage: "Best practices for organizing React components include...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      messageCount: 6,
      model: "GPT-OSS-70B",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions((prev) => prev.filter((session) => session.id !== chatId))
    if (currentChatId === chatId) {
      onSelectChat("default")
    }
  }

  const handleEditTitle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const session = sessions.find((s) => s.id === chatId)
    if (session) {
      setEditingId(chatId)
      setEditTitle(session.title)
    }
  }

  const handleSaveTitle = (chatId: string) => {
    setSessions((prev) => prev.map((session) => (session.id === chatId ? { ...session, title: editTitle } : session)))
    setEditingId(null)
    setEditTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleSaveTitle(chatId)
    } else if (e.key === "Escape") {
      setEditingId(null)
      setEditTitle("")
    }
  }

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newSession: ChatSession = {
      id: newChatId,
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      model: "GPT-OSS-120B",
    }
    setSessions((prev) => [newSession, ...prev])
    onSelectChat(newChatId)
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground">Chat History</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-sidebar-accent group ${
                currentChatId === session.id ? "bg-sidebar-accent border-sidebar-primary" : "bg-transparent"
              }`}
              onClick={() => {
                onSelectChat(session.id)
                onClose()
              }}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  {editingId === session.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, session.id)}
                      onBlur={() => handleSaveTitle(session.id)}
                      className="text-sm font-medium h-6 p-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="text-sm font-medium text-sidebar-foreground line-clamp-2 flex-1">{session.title}</h3>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleEditTitle(session.id, e)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:text-destructive"
                      onClick={(e) => handleDeleteChat(session.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{session.lastMessage}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {session.messageCount}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {session.model}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(session.timestamp)}</span>
                </div>
              </div>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
