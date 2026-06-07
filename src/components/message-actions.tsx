"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  MoreHorizontalIcon,
  ReplyIcon,
  SmileIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import { cn } from "@/lib/utils"

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢"] as const

const actionButtonClassName =
  "size-7 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"

export function MessageReactionBadge({
  emoji,
  align = "left",
}: {
  emoji: string
  align?: "left" | "right"
}) {
  return (
    <div
      className={cn(
        "flex w-full -mt-2.5",
        align === "left" ? "justify-start" : "justify-end",
      )}
    >
      <span
        className="inline-flex min-w-6 items-center justify-center rounded-full border border-border/50 bg-background px-2 py-0.5 text-sm shadow-sm"
        aria-label={`Reacted with ${emoji}`}
      >
        {emoji}
      </span>
    </div>
  )
}

function ReactionPickerPanel({
  open,
  side,
  anchorRef,
  onClose,
  onReact,
}: {
  open: boolean
  side: "left" | "right"
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
  onReact: (emoji: string) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open || !anchorRef.current) return

    function updatePosition() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const panelWidth = 320
      const gap = 8

      setPosition({
        top: rect.top - gap,
        left:
          side === "right"
            ? rect.left
            : Math.max(gap, rect.right - panelWidth),
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open, anchorRef, side])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (anchorRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      onClose()
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, anchorRef, onClose])

  if (!open || typeof document === "undefined") return null

  function handleReact(emoji: string) {
    onReact(emoji)
    onClose()
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Choose a reaction"
      className="fixed z-[200] w-80 -translate-y-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center gap-0.5 border-b p-1.5">
        {QUICK_REACTIONS.map((emoji) => (
          <Button
            key={emoji}
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-8 rounded-full text-lg hover:bg-muted"
            aria-label={`React with ${emoji}`}
            onClick={() => handleReact(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <EmojiPicker
        className="h-[280px] w-full"
        onEmojiSelect={({ emoji }) => handleReact(emoji)}
      >
        <EmojiPickerSearch />
        <EmojiPickerContent />
        <EmojiPickerFooter />
      </EmojiPicker>
    </div>,
    document.body,
  )
}

export function MessageActions({
  side,
  canReact = false,
  hasReaction = false,
  onReact,
}: {
  side: "left" | "right"
  canReact?: boolean
  hasReaction?: boolean
  onReact?: (emoji: string) => void
}) {
  const [reactOpen, setReactOpen] = useState(false)
  const reactButtonRef = useRef<HTMLButtonElement>(null)

  const showReact = !hasReaction
  const reactEnabled = showReact && canReact && Boolean(onReact)

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 self-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
        reactOpen && "opacity-100",
        side === "right" ? "flex-row" : "flex-row-reverse",
      )}
    >
      {showReact ? (
        reactEnabled ? (
          <>
            <button
              ref={reactButtonRef}
              type="button"
              aria-label="React"
              aria-expanded={reactOpen}
              aria-haspopup="dialog"
              className={cn(
                actionButtonClassName,
                "inline-flex items-center justify-center",
              )}
              onClick={(event) => {
                event.stopPropagation()
                setReactOpen((open) => !open)
              }}
            >
              <SmileIcon className="size-4" />
            </button>
            <ReactionPickerPanel
              open={reactOpen}
              side={side}
              anchorRef={reactButtonRef}
              onClose={() => setReactOpen(false)}
              onReact={(emoji) => onReact?.(emoji)}
            />
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled
            aria-label="React"
            className={actionButtonClassName}
          >
            <SmileIcon className="size-4" />
          </Button>
        )
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled
        aria-label="Reply"
        className={actionButtonClassName}
      >
        <ReplyIcon className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled
        aria-label="More options"
        className={actionButtonClassName}
      >
        <MoreHorizontalIcon className="size-4" />
      </Button>
    </div>
  )
}
