"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MoodState } from "@/lib/relationship/types";

export type MoodContextValue = {
  moodState: MoodState;
  relationshipHealth: number;
};

export type MoodContextSetter = {
  setMoodState: (mood: MoodState) => void;
  setRelationshipHealth: (health: number) => void;
};

const MoodContext = createContext<MoodContextValue>({
  moodState: "normal",
  relationshipHealth: 70,
});

const MoodSetterContext = createContext<MoodContextSetter>({
  setMoodState: () => {},
  setRelationshipHealth: () => {},
});

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moodState, setMoodState] = useState<MoodState>("normal");
  const [relationshipHealth, setRelationshipHealth] = useState(70);

  return (
    <MoodSetterContext.Provider value={{ setMoodState, setRelationshipHealth }}>
      <MoodContext.Provider value={{ moodState, relationshipHealth }}>
        {children}
      </MoodContext.Provider>
    </MoodSetterContext.Provider>
  );
}

export function useMood(): MoodContextValue {
  return useContext(MoodContext);
}

export function useMoodSetter(): MoodContextSetter {
  return useContext(MoodSetterContext);
}
