"use client";

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { updateUserProfileField } from "@/app/account/actions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/lib/auth-client";
import { MBTI_TYPES } from "@/lib/gf-profile-schema";
import type { UserProfileRecord } from "@/lib/user-profile";
import type {
  UserProfileActionState,
  UserProfileField,
} from "@/lib/user-profile-schema";
import { cn } from "@/lib/utils";
import { ZODIAC_SIGNS } from "@/lib/zodiac";

const selectClassName = cn(
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
);

const initialActionState: UserProfileActionState = {};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d));
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}

function ProfileRow({
  label,
  value,
  onEdit,
  editable = true,
}: {
  label: string;
  value: ReactNode;
  onEdit?: () => void;
  editable?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
      {editable && onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onEdit}
        >
          <PencilIcon />
          Edit
        </Button>
      ) : null}
    </div>
  );
}

function FieldEditorDialog({
  open,
  onOpenChange,
  title,
  description,
  field,
  initialValue,
  onSaved,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  field: UserProfileField;
  initialValue: string;
  onSaved: (value: string | null) => void;
  children: (props: {
    value: string;
    setValue: (value: string) => void;
    fieldError?: string;
  }) => ReactNode;
}) {
  const [value, setValue] = useState(initialValue);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(
    updateUserProfileField,
    initialActionState,
  );

  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setFormKey((current) => current + 1);
    }
  }, [open, initialValue]);

  useEffect(() => {
    if (state.success) {
      onSaved(value.trim() === "" ? null : value.trim());
      onOpenChange(false);
    }
  }, [state.success, onOpenChange, onSaved, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form key={formKey} action={formAction}>
          <input type="hidden" name="field" value={field} />
          <input type="hidden" name="value" value={value} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="py-4">{children({ value, setValue, fieldError: state.fieldError })}</div>
          {state.error ? (
            <p className="pb-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2Icon className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AccountProfile({ profile }: { profile: UserProfileRecord }) {
  const router = useRouter();
  const [data, setData] = useState(profile);
  const [signOutPending, startSignOut] = useTransition();
  const [editingField, setEditingField] = useState<UserProfileField | null>(
    null,
  );

  const initials = getInitials(data.name);

  function updateField(field: UserProfileField, value: string | null) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      router.push("/login");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal details. Everything except email is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <ProfileRow
            label="Avatar"
            value={
              <Avatar className="size-12 rounded-lg">
                <AvatarImage src={data.image ?? undefined} alt={data.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
            }
            onEdit={() => setEditingField("image")}
          />
          <ProfileRow
            label="Name"
            value={data.name}
            onEdit={() => setEditingField("name")}
          />
          <ProfileRow
            label="Description"
            value={
              data.description ? (
                <span className="whitespace-pre-wrap">{data.description}</span>
              ) : (
                "Not set"
              )
            }
            onEdit={() => setEditingField("description")}
          />
          <ProfileRow
            label="Date of birth"
            value={formatDate(data.dateOfBirth)}
            onEdit={() => setEditingField("dateOfBirth")}
          />
          <ProfileRow
            label="MBTI"
            value={data.mbti ?? "Not set"}
            onEdit={() => setEditingField("mbti")}
          />
          <ProfileRow
            label="Zodiac"
            value={data.zodiacSign ?? "Not set"}
            onEdit={() => setEditingField("zodiacSign")}
          />
          <ProfileRow
            label="Email"
            editable={false}
            value={data.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account actions</CardTitle>
          <CardDescription>
            Sign out or manage your account lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={signOutPending}
          >
            {signOutPending ? <Loader2Icon className="animate-spin" /> : null}
            Sign out
          </Button>
          <Button type="button" variant="destructive" disabled>
            <Trash2Icon />
            Delete account
          </Button>
        </CardContent>
      </Card>

      <FieldEditorDialog
        open={editingField === "image"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit avatar"
        description="Paste a URL to an image you'd like to use as your avatar."
        field="image"
        initialValue={data.image ?? ""}
        onSaved={(value) => updateField("image", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="avatar-url">Image URL</Label>
            <Input
              id="avatar-url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>

      <FieldEditorDialog
        open={editingField === "name"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit name"
        field="name"
        initialValue={data.name}
        onSaved={(value) => updateField("name", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={64}
            />
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>

      <FieldEditorDialog
        open={editingField === "description"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit description"
        description="A short bio about yourself."
        field="description"
        initialValue={data.description ?? ""}
        onSaved={(value) => updateField("description", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us a little about yourself..."
            />
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>

      <FieldEditorDialog
        open={editingField === "dateOfBirth"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit date of birth"
        field="dateOfBirth"
        initialValue={data.dateOfBirth ?? ""}
        onSaved={(value) => updateField("dateOfBirth", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="date-of-birth">Date of birth</Label>
            <Input
              id="date-of-birth"
              type="date"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to clear this field.
            </p>
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>

      <FieldEditorDialog
        open={editingField === "mbti"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit MBTI"
        field="mbti"
        initialValue={data.mbti ?? ""}
        onSaved={(value) => updateField("mbti", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="mbti">MBTI type</Label>
            <select
              id="mbti"
              className={selectClassName}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            >
              <option value="">Not set</option>
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>

      <FieldEditorDialog
        open={editingField === "zodiacSign"}
        onOpenChange={(open) => !open && setEditingField(null)}
        title="Edit zodiac sign"
        field="zodiacSign"
        initialValue={data.zodiacSign ?? ""}
        onSaved={(value) => updateField("zodiacSign", value)}
      >
        {({ value, setValue, fieldError }) => (
          <div className="space-y-2">
            <Label htmlFor="zodiac">Zodiac sign</Label>
            <select
              id="zodiac"
              className={selectClassName}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            >
              <option value="">Not set</option>
              {ZODIAC_SIGNS.map((sign) => (
                <option key={sign} value={sign}>
                  {sign}
                </option>
              ))}
            </select>
            {fieldError ? (
              <p className="text-xs text-destructive">{fieldError}</p>
            ) : null}
          </div>
        )}
      </FieldEditorDialog>
    </div>
  );
}
