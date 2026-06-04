import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
};

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="gap-3">
      <div className="flex items-center justify-between px-6">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon ? (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        ) : null}
      </div>
      <div className="px-6">
        <p className={cn("font-mono text-3xl font-semibold tracking-tight")}>
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </Card>
  );
}
