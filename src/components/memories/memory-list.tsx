"use client";

import { useActionState } from "react";
import { SparklesIcon, Trash2Icon } from "lucide-react";

import {
  deleteMemory,
  type DeleteMemoryActionState,
} from "@/app/memories/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MemoryRow } from "@/lib/relationship/memories";

function formatMemoryDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MemoryCard({ memory }: { memory: MemoryRow }) {
  const [, formAction, isPending] = useActionState<
    DeleteMemoryActionState,
    FormData
  >(deleteMemory, {});

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="grid-cols-[1fr_auto] items-start gap-3 px-5 pb-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium leading-snug">
            {memory.content}
          </CardTitle>
          <CardDescription>{formatMemoryDate(memory.createdAt)}</CardDescription>
        </div>
        <form action={formAction}>
          <input type="hidden" name="memoryId" value={memory.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            aria-label="Delete memory"
          >
            <Trash2Icon />
          </Button>
        </form>
      </CardHeader>
    </Card>
  );
}

export function MemoryList({ memories }: { memories: MemoryRow[] }) {
  if (memories.length === 0) {
    return (
      <Card className="border-dashed py-12">
        <CardContent className="flex flex-col items-center gap-3 px-6 text-center">
          <SparklesIcon className="size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">No Memories</p>
            <p className="text-sm text-muted-foreground max-w-md md:max-w-[500px]">
              Every small detail you share about yourself in chat will be saved here by your girlfriend. This is a sign that she wants to remember every little thing about you.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      {memories.map((memory) => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}
    </div>
  );
}