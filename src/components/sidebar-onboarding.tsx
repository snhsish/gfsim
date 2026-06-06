"use client";

import * as React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import {
  isUserOnboardingDone,
  markUserOnboardingDone,
} from "@/lib/user-onboarding-storage";
import { cn } from "@/lib/utils";

export type SidebarOnboardingStep = {
  id: string;
  title: string;
  description: string;
};

export const WELCOME_ONBOARDING_STEPS: SidebarOnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to GFSim",
    description:
      "We simulate your relationship with your girlfriend however you like it. We shape her around how you want and the conversations are meant to feel as much natural as possible. Get ready.",
  },
  {
    id: "customize",
    title: "Make her yours",
    description:
      "Fine-tune every part of her personality from the Personality tab. And if you ever hit rate limits, you can bring in your own models and API keys under the Configure tab.",
  },
  {
    id: "tour-intro",
    title: "Quick tour",
    description:
      "Before you dive in, we'll walk you through the app navigation so you know where everything lives. Takes less than a minute.",
  },
];

export const SIDEBAR_ONBOARDING_STEPS: SidebarOnboardingStep[] = [
  {
    id: "chat",
    title: "Chat",
    description:
      "Your only place to talk with her. Send messages and stickers, react to her messages, share images and videos, and keep the conversation going.",
  },
  {
    id: "memories",
    title: "Memories",
    description:
      "Every sweet moment and cringe-worthy memory you've shared is saved here. Revisit them anytime to relive the good times or maybe laugh at the bad ones.",
  },
  {
    id: "personality",
    title: "Personality",
    description:
      "Want a different vibe? Tweak her personality, traits, and how she comes across whenever you feel like it. Or maybe just describe your ex-girlfriend.",
  },
  {
    id: "usage",
    title: "Usage",
    description:
      "Keep track on your message limits, token usage, and API stats.",
  },
  {
    id: "configure",
    title: "Configure",
    description:
      "Bring your own models or API keys and talk with your girlfriend without hitting any limits.",
  },
];

type OnboardingPhase = "welcome" | "tour" | null;

type SidebarOnboardingContextValue = {
  activeStepId: string | null;
  activeStepIndex: number;
  totalSteps: number;
  isTourActive: boolean;
  next: () => void;
  skip: () => void;
};

const SidebarOnboardingContext =
  React.createContext<SidebarOnboardingContextValue | null>(null);

export function useSidebarOnboarding() {
  return React.useContext(SidebarOnboardingContext);
}

function StepDots({
  total,
  current,
  className,
}: {
  total: number;
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full transition-colors",
            index === current ? "bg-primary" : "bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function WelcomeOnboardingModal({
  open,
  stepIndex,
  onNext,
  onSkip,
}: {
  open: boolean;
  stepIndex: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const step = WELCOME_ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === WELCOME_ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <p className="text-xs text-muted-foreground">
            {stepIndex + 1} of {WELCOME_ONBOARDING_STEPS.length}
          </p>
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <StepDots
          total={WELCOME_ONBOARDING_STEPS.length}
          current={stepIndex}
          className="justify-center py-1"
        />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            Skip
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {isLastStep ? "Show me around" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SidebarOnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [phase, setPhase] = React.useState<OnboardingPhase>(null);
  const [welcomeStepIndex, setWelcomeStepIndex] = React.useState(0);
  const [tourStepIndex, setTourStepIndex] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
    if (!isUserOnboardingDone()) {
      setPhase("welcome");
    }
  }, []);

  const complete = React.useCallback(() => {
    markUserOnboardingDone();
    setPhase(null);
  }, []);

  const skip = React.useCallback(() => {
    complete();
  }, [complete]);

  const welcomeNext = React.useCallback(() => {
    if (welcomeStepIndex >= WELCOME_ONBOARDING_STEPS.length - 1) {
      setPhase("tour");
      setTourStepIndex(0);
      return;
    }
    setWelcomeStepIndex((current) => current + 1);
  }, [welcomeStepIndex]);

  const tourNext = React.useCallback(() => {
    if (tourStepIndex >= SIDEBAR_ONBOARDING_STEPS.length - 1) {
      complete();
      return;
    }
    setTourStepIndex((current) => current + 1);
  }, [complete, tourStepIndex]);

  React.useEffect(() => {
    if (phase !== "tour" || !isMobile) return;
    setOpenMobile(true);
  }, [phase, tourStepIndex, isMobile, setOpenMobile]);

  const isTourActive = hydrated && phase === "tour";
  const activeStep =
    phase === "tour" ? SIDEBAR_ONBOARDING_STEPS[tourStepIndex] : null;

  const value = React.useMemo(
    (): SidebarOnboardingContextValue => ({
      activeStepId: activeStep?.id ?? null,
      activeStepIndex: tourStepIndex,
      totalSteps: SIDEBAR_ONBOARDING_STEPS.length,
      isTourActive,
      next: tourNext,
      skip,
    }),
    [activeStep?.id, isTourActive, skip, tourNext, tourStepIndex],
  );

  return (
    <SidebarOnboardingContext.Provider value={value}>
      <WelcomeOnboardingModal
        open={hydrated && phase === "welcome"}
        stepIndex={welcomeStepIndex}
        onNext={welcomeNext}
        onSkip={skip}
      />
      {children}
    </SidebarOnboardingContext.Provider>
  );
}

export function SidebarOnboardingNavItem({
  onboardingId,
  children,
}: {
  onboardingId?: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  const tour = useSidebarOnboarding();
  const isTarget =
    Boolean(onboardingId) &&
    tour?.isTourActive &&
    tour.activeStepId === onboardingId;

  if (!isTarget || !tour) {
    return children;
  }

  const step = SIDEBAR_ONBOARDING_STEPS[tour.activeStepIndex];
  const isLastStep = tour.activeStepIndex === tour.totalSteps - 1;

  return (
    <Popover open>
      <PopoverAnchor asChild>
        {React.cloneElement(children, {
          className: cn(
            children.props.className,
            "ring-2 ring-primary ring-offset-2 ring-offset-sidebar",
          ),
        })}
      </PopoverAnchor>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-72 p-4"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <PopoverHeader>
          <p className="text-xs text-muted-foreground">
            {tour.activeStepIndex + 1} of {tour.totalSteps}
          </p>
          <PopoverTitle>{step.title}</PopoverTitle>
          <PopoverDescription>{step.description}</PopoverDescription>
        </PopoverHeader>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={tour.skip}
          >
            Skip tour
          </Button>
          <Button type="button" size="sm" onClick={tour.next}>
            {isLastStep ? "Got it" : "Next"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
