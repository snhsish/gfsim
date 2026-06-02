"use client";

import { useEffect, useRef, useState } from "react";
import {
  pauseBetweenBubbles,
  type ParsedGirlfriendReply,
  typingDelayForText,
} from "@/lib/chat/girlfriend-response";

type RevealState = {
  messageId: string;
  visibleCount: number;
  isTyping: boolean;
  done: boolean;
};

function partsKey(parsed: ParsedGirlfriendReply | null): string {
  if (!parsed || parsed.kind !== "messages") return "";
  return parsed.messages.join("\x1e");
}

export function useGirlfriendBubbleReveal(
  messageId: string | null,
  parsed: ParsedGirlfriendReply | null,
  shouldAnimate: boolean,
): RevealState | null {
  const [state, setState] = useState<RevealState | null>(null);
  const timersRef = useRef<number[]>([]);
  const key = partsKey(parsed);

  useEffect(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];

    if (!messageId || !key) {
      setState(null);
      return;
    }

    const parts = key.split("\x1e");
    if (!shouldAnimate || parts.length === 0) {
      setState({
        messageId,
        visibleCount: parts.length,
        isTyping: false,
        done: true,
      });
      return;
    }

    setState({
      messageId,
      visibleCount: 0,
      isTyping: true,
      done: false,
    });

    let index = 0;

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    const revealNext = () => {
      const text = parts[index];
      if (!text) return;

      const delay = typingDelayForText(text, index === 0);
      schedule(() => {
        index += 1;
        const visibleCount = index;
        const done = visibleCount >= parts.length;

        setState({
          messageId,
          visibleCount,
          isTyping: !done,
          done,
        });

        if (!done) {
          schedule(revealNext, pauseBetweenBubbles());
        }
      }, delay);
    };

    revealNext();

    return () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current = [];
    };
  }, [messageId, key, shouldAnimate]);

  return state;
}
