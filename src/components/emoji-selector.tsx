"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    EmojiPicker,
    EmojiPickerSearch,
    EmojiPickerContent,
    EmojiPickerFooter,
} from "@/components/ui/emoji-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SmileIcon } from "lucide-react";


export default function EmojiSelector({
    onEmojiSelect,
}: {
    onEmojiSelect: ({ emoji, label }: { emoji: string; label: string }) => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Popover onOpenChange={setIsOpen} open={isOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                    <SmileIcon className="size-5 stroke-[1.75]" />
                    <span className="sr-only">Open emoji picker</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" className="w-fit p-0">
                <EmojiPicker
                    className="h-[342px]"
                    onEmojiSelect={onEmojiSelect}
                >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
}