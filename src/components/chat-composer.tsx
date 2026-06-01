"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ImageIcon,
  PaperclipIcon,
  SendHorizontalIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import EmojiSelector from "@/components/emoji-selector"

const MAX_TEXTAREA_HEIGHT = 160

function ToolbarIconButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-9 rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function ChatComposer({
  className,
  onSend,
  value,
  onValueChange,
  textareaRef: textareaRefProp,
}: {
  className?: string
  onSend?: (payload: { text: string; photos: File[] }) => void
  value?: string
  onValueChange?: (message: string) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = textareaRefProp ?? internalTextareaRef
  const [internalMessage, setInternalMessage] = useState("")
  const message = value ?? internalMessage
  const setMessage = onValueChange ?? setInternalMessage
  const [photos, setPhotos] = useState<File[]>([])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [gifOpen, setGifOpen] = useState(false)

  const photoPreviewUrls = useMemo(
    () => photos.map((file) => URL.createObjectURL(file)),
    [photos]
  )

  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photoPreviewUrls])

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)
    el.style.height = `${nextHeight}px`
    el.style.overflowY =
      el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden"
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [message, adjustTextareaHeight])

  const canSend = message.trim().length > 0 || photos.length > 0

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setMessage(message + emoji)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = message.slice(0, start) + emoji + message.slice(end)
    setMessage(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
      adjustTextareaHeight()
    })
  }

  function handlePhotoSelect(files: FileList | null) {
    if (!files?.length) return
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (images.length) {
      setPhotos((prev) => [...prev, ...images])
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSend() {
    if (!canSend) return
    onSend?.({ text: message.trim(), photos })
    setMessage("")
    setPhotos([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    requestAnimationFrame(adjustTextareaHeight)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-1">
          {photos.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative size-16 overflow-hidden rounded-sm border border-border/50 bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreviewUrls[index]}
                alt={file.name}
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute top-1 right-1 size-5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removePhoto(index)}
                aria-label={`Remove ${file.name}`}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-4 rounded-3xl bg-muted px-4 py-4 dark:bg-muted/80">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            handlePhotoSelect(e.target.files)
            e.target.value = ""
          }}
        />

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={adjustTextareaHeight}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={2}
          wrap="soft"
          className="block w-full min-h-12 resize-none overflow-hidden border-0 bg-transparent p-0 text-[0.9375rem] leading-6 whitespace-pre-wrap outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          aria-label="Message input"
        />

        <div className="flex items-center justify-between gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarIconButton aria-label="Add attachment">
                <PaperclipIcon className="size-5 stroke-[1.75]" />
              </ToolbarIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="min-w-40">
              <DropdownMenuItem
                onSelect={() => fileInputRef.current?.click()}
              >
                <ImageIcon />
                Photo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-0.5">
            <EmojiSelector
              onEmojiSelect={({ emoji }) => insertEmoji(emoji)}
            />

            <Popover open={gifOpen} onOpenChange={setGifOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-full px-3 text-xs font-semibold tracking-wide text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  aria-label="Insert GIF"
                  aria-expanded={gifOpen}
                >
                  GIF
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                className="w-72 p-3"
              >
                <p className="text-sm font-medium">GIFs</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coming soon.
                </p>
              </PopoverContent>
            </Popover>

            <ToolbarIconButton
              aria-label="Send message"
              disabled={!canSend}
              onClick={handleSend}
              className={cn(
                canSend &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <SendHorizontalIcon className="size-5 stroke-[1.75]" />
            </ToolbarIconButton>
          </div>
        </div>
      </div>
    </div>
  )
}
