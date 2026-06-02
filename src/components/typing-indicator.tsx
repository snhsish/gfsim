import { cn } from "@/lib/utils";

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1 py-0.5",
        className,
      )}
      aria-label="Typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-current opacity-70"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
