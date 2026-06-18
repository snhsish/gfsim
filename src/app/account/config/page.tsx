import type { Metadata } from "next";
import { ConfigureForm } from "@/components/configure-form";

export const metadata: Metadata = {
  title: "Configure · GFSim",
  description: "Configure your own Gemini API key",
};

export default function ConfigurePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Configure
          </h1>
          <p className="text-sm text-muted-foreground">
            Add your own Google Gemini API key to use{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-medium">
              gemini-2.5-flash
            </code>{" "}
            as your chat model instead of the server default.
          </p>
        </div>
        <ConfigureForm />
      </div>
    </div>
  );
}
