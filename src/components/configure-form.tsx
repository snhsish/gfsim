"use client";

import { EyeIcon, EyeOffIcon, KeyIcon, LoaderIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConfigureForm() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gemini-api-key");
    if (stored) {
      setHasSavedKey(true);
      setApiKey(stored);
    }
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      localStorage.removeItem("gemini-api-key");
      setHasSavedKey(false);
    } else {
      localStorage.setItem("gemini-api-key", trimmed);
      setHasSavedKey(true);
    }
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  }, [apiKey]);

  const handleClear = useCallback(() => {
    setApiKey("");
    localStorage.removeItem("gemini-api-key");
    setHasSavedKey(false);
    setSaved(false);
    setTestResult(null);
  }, []);

  const handleTest = useCallback(async () => {
    const key = apiKey.trim();
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say OK" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });
      setTestResult(res.ok ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  }, [apiKey]);

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-4" />
            Gemini API Key
          </CardTitle>
          <CardDescription>
            Your key is stored in your browser's local storage and sent directly
            to Google's API. It never touches our server outside of forwarding
            it to Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder={hasSavedKey ? "Key is saved" : "AIza..."}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={!apiKey.trim() && !hasSavedKey}>
              <SaveIcon />
              {apiKey.trim() ? "Save" : "Remove"}
            </Button>
            {hasSavedKey && (
              <Button variant="outline" onClick={handleClear}>
                <TrashIcon />
                Clear
              </Button>
            )}
            {apiKey.trim() && (
              <Button variant="secondary" onClick={handleTest} disabled={testing}>
                {testing ? <LoaderIcon className="animate-spin" /> : null}
                Test key
              </Button>
            )}
          </div>

          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {apiKey.trim() ? "API key saved locally." : "API key removed."}
            </p>
          )}
          {testResult === "success" && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Key is valid! Gemini responds correctly.
            </p>
          )}
          {testResult === "error" && (
            <p className="text-sm text-destructive">
              Key test failed. Check that the key is correct and has access to{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">gemini-2.5-flash</code>.
            </p>
          )}
        </CardContent>
      </Card>
      
      <div className="rounded-sm bg-muted p-4 text-sm text-muted-foreground w-full">
        <p className="font-medium text-foreground">How it works</p>
        <ol className="mt-1 list-decimal space-y-1 pl-4">
          <li>Enter your Gemini API key above and save.</li>
          <li>
            The key is stored in your browser (localStorage) and sent with
            each chat request to the server.
          </li>
          <li>
            The server forwards it to Google{"'"}s API using{" "}
            <code className="rounded bg-muted/50 px-1">gemini-2.5-flash</code>.
          </li>
          <li>No key? The server default model is used instead.</li>
        </ol>
      </div>
    </div>
  );
}
