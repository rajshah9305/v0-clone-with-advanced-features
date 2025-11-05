"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit3,
  Share,
  Bookmark,
  MoreHorizontal,
  Flag,
} from "lucide-react"

interface MessageActionsProps {
  messageId: string
  content: string
  onRegenerate?: () => void
  onEdit?: (newContent: string) => void
  onRate?: (rating: "up" | "down") => void
}

export function MessageActions({ messageId, content, onRegenerate, onEdit, onRate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<"up" | "down" | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [bookmarked, setBookmarked] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRate = (newRating: "up" | "down") => {
    const finalRating = rating === newRating ? null : newRating
    setRating(finalRating)
    onRate?.(finalRating as "up" | "down")
  }

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editContent)
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "AI Response",
        text: content,
      })
    } else {
      // Fallback to copying link
      await navigator.clipboard.writeText(window.location.href + `#message-${messageId}`)
    }
  }

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Primary Actions */}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${rating === "up" ? "text-green-500 bg-green-50" : ""}`}
        onClick={() => handleRate("up")}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${rating === "down" ? "text-red-500 bg-red-50" : ""}`}
        onClick={() => handleRate("down")}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>

      {onRegenerate && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRegenerate}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}

      {/* More Actions */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-48" align="end">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleEdit}>
              <Edit3 className="h-3 w-3 mr-2" />
              {isEditing ? "Save Edit" : "Edit Message"}
            </Button>

            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleShare}>
              <Share className="h-3 w-3 mr-2" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start ${bookmarked ? "text-yellow-600" : ""}`}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <Bookmark className={`h-3 w-3 mr-2 ${bookmarked ? "fill-current" : ""}`} />
              {bookmarked ? "Remove Bookmark" : "Bookmark"}
            </Button>

            <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
              <Flag className="h-3 w-3 mr-2" />
              Report
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Mode */}
      {isEditing && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg z-10">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] mb-2"
            placeholder="Edit message..."
          />
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Editing message
            </Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
