"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGfProfileDraft } from "@/hooks/use-gf-profile-draft";
import { MBTI_TYPES } from "@/lib/gf-profile-schema";
import {
  ONBOARDING_STEPS,
  stepForFieldError,
  validateOnboardingStep,
  type StepFieldErrors,
} from "@/lib/onboarding-steps";
import { clearOnboardingDraft, type OnboardingDraft } from "@/lib/onboarding-storage";
import type { GfProfileActionState } from "@/lib/gf-profile-persist";
import {
  getAgeFromBirthDate,
  getMaturityLabel,
  getMaturityTier,
  type MaturityTier,
} from "@/lib/maturity";
import { cn } from "@/lib/utils";
import { getZodiacSign, ZODIAC_SIGNS } from "@/lib/zodiac";

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
);

const initialState: GfProfileActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function StepProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="font-medium text-foreground">
          {ONBOARDING_STEPS[currentStep]?.title}
        </span>
      </div>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index <= currentStep ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}

type GfProfileFormProps = {
  mode: "create" | "edit";
  initialDraft?: OnboardingDraft;
  action: (
    prev: GfProfileActionState,
    formData: FormData,
  ) => Promise<GfProfileActionState>;
  submitLabel?: string;
  pendingLabel?: string;
  footerText?: string | null;
};

export function GfProfileForm({
  mode,
  initialDraft,
  action,
  submitLabel = "Start chatting",
  pendingLabel = "Saving…",
  footerText,
}: GfProfileFormProps) {
  const { draft, updateDraft, hydrated } = useGfProfileDraft(mode, initialDraft);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [stepErrors, setStepErrors] = useState<StepFieldErrors>({});

  const step = draft.step;
  const stepMeta = ONBOARDING_STEPS[step]!;

  const derived = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dateOfBirth)) {
      return null;
    }
    const [y, m, d] = draft.dateOfBirth.split("-").map(Number);
    const dob = new Date(Date.UTC(y!, m! - 1, d));
    if (
      dob.getUTCFullYear() !== y ||
      dob.getUTCMonth() !== m! - 1 ||
      dob.getUTCDate() !== d
    ) {
      return null;
    }
    const age = getAgeFromBirthDate(dob);
    const tier = getMaturityTier(dob);
    const zodiac = getZodiacSign(dob);
    return { age, tier, zodiac };
  }, [draft.dateOfBirth]);

  const zodiacValue = draft.useCustomZodiac
    ? draft.zodiacOverride || derived?.zodiac || ""
    : (derived?.zodiac ?? "");

  useEffect(() => {
    if (!state.fieldErrors) return;
    const errorStep = stepForFieldError(state.fieldErrors);
    if (errorStep !== null && errorStep !== draft.step) {
      updateDraft({ step: errorStep });
    }
    setStepErrors(state.fieldErrors);
  }, [state.fieldErrors, draft.step, updateDraft]);

  const wasPending = useRef(false);
  useEffect(() => {
    if (mode === "create" && wasPending.current && !isPending && !state.error) {
      clearOnboardingDraft();
    }
    wasPending.current = isPending;
  }, [isPending, state.error, mode]);

  function goToStep(nextStep: number) {
    updateDraft({ step: nextStep });
    setStepErrors({});
  }

  function handleNext() {
    const result = validateOnboardingStep(step, draft);
    if (!result.ok) {
      setStepErrors(result.fieldErrors);
      return;
    }
    setStepErrors({});
    goToStep(step + 1);
  }

  function handleBack() {
    setStepErrors({});
    goToStep(Math.max(0, step - 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateOnboardingStep(2, draft);
    if (!result.ok) {
      event.preventDefault();
      setStepErrors(result.fieldErrors);
    }
  }

  const errors = { ...stepErrors, ...state.fieldErrors };

  if (!hydrated) {
    return (
      <div className="w-full max-w-lg space-y-4">
        <div className="h-1 animate-pulse rounded-full bg-muted" />
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-sm text-muted-foreground">
              Loading…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-6"
    >
      <input type="hidden" name="name" value={draft.name} />
      <input type="hidden" name="dateOfBirth" value={draft.dateOfBirth} />
      <input type="hidden" name="nativeLanguage" value={draft.nativeLanguage} />
      <input type="hidden" name="nationality" value={draft.nationality} />
      <input
        type="hidden"
        name="isBisexual"
        value={draft.isBisexual === null ? "" : String(draft.isBisexual)}
      />
      <input type="hidden" name="mbti" value={draft.mbti} />
      <input type="hidden" name="zodiacSign" value={zodiacValue} />

      <StepProgress currentStep={step} totalSteps={ONBOARDING_STEPS.length} />

      {state.success ? (
        <p
          className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center text-sm text-foreground"
          role="status"
        >
          Personality saved.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">{stepMeta.title}</CardTitle>
          <CardDescription>{stepMeta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Her name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Emma"
                  autoComplete="off"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
                <FieldError message={errors.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={draft.dateOfBirth}
                  onChange={(e) =>
                    updateDraft({ dateOfBirth: e.target.value })
                  }
                />
                <FieldError message={errors.dateOfBirth} />
                {derived ? (
                  <p className="text-xs text-muted-foreground">
                    Age {derived.age} · Maturity:{" "}
                    <span className="text-foreground">
                      {getMaturityLabel(derived.tier as MaturityTier)}
                    </span>
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nativeLanguage">Native language</Label>
                <Input
                  id="nativeLanguage"
                  placeholder="e.g. Hindi, Spanish, English"
                  value={draft.nativeLanguage}
                  onChange={(e) =>
                    updateDraft({ nativeLanguage: e.target.value })
                  }
                />
                <FieldError message={errors.nativeLanguage} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  placeholder="e.g. Indian, Brazilian"
                  value={draft.nationality}
                  onChange={(e) =>
                    updateDraft({ nationality: e.target.value })
                  }
                />
                <FieldError message={errors.nationality} />
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">
                  Is she bisexual?{" "}
                  {/* <span className="font-normal text-muted-foreground"></span> */}
                </legend>
                <div className="flex flex-wrap gap-2">
                  <label
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      draft.isBisexual === true &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="isBisexualChoice"
                      className="accent-primary"
                      checked={draft.isBisexual === true}
                      onChange={() => updateDraft({ isBisexual: true })}
                    />
                    Yes
                  </label>
                  <label
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      draft.isBisexual === false &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="isBisexualChoice"
                      className="accent-primary"
                      checked={draft.isBisexual === false}
                      onChange={() => updateDraft({ isBisexual: false })}
                    />
                    No
                  </label>
                </div>
                <FieldError message={errors.isBisexual} />
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="mbti">
                  MBTI{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <select
                  id="mbti"
                  className={selectClassName}
                  value={draft.mbti}
                  onChange={(e) => updateDraft({ mbti: e.target.value })}
                >
                  <option value="">Skip: we&apos;ll improvise</option>
                  {MBTI_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>
                    Zodiac{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  {derived ? (
                    <button
                      type="button"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        const nextCustom = !draft.useCustomZodiac;
                        updateDraft({
                          useCustomZodiac: nextCustom,
                          zodiacOverride: nextCustom
                            ? draft.zodiacOverride || derived.zodiac
                            : draft.zodiacOverride,
                        });
                      }}
                    >
                      {draft.useCustomZodiac
                        ? "Use sign from birthday"
                        : "Pick manually"}
                    </button>
                  ) : null}
                </div>
                {draft.useCustomZodiac ? (
                  <select
                    className={selectClassName}
                    value={draft.zodiacOverride || derived?.zodiac || ""}
                    onChange={(e) =>
                      updateDraft({ zodiacOverride: e.target.value })
                    }
                  >
                    {ZODIAC_SIGNS.map((sign) => (
                      <option key={sign} value={sign}>
                        {sign}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {derived
                      ? `From her birthday: ${derived.zodiac}`
                      : "Set her date of birth to infer her sign."}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {state.error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isPending}
            onClick={handleBack}
          >
            Back
          </Button>
        ) : null}

        {step < ONBOARDING_STEPS.length - 1 ? (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={handleNext}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? pendingLabel : submitLabel}
          </Button>
        )}
      </div>

      {footerText ? (
        <p className="text-center text-xs text-muted-foreground">{footerText}</p>
      ) : null}
    </form>
  );
}
