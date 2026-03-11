"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { updateWorkoutAction } from "./actions";

type Props = {
  workoutId: number;
  defaultName: string;
  defaultDate: string;
};

export default function EditWorkoutForm({ workoutId, defaultName, defaultDate }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const dateStr = (form.elements.namedItem("startedAt") as HTMLInputElement).value;
    const [year, month, day] = dateStr.split("-").map(Number);
    const startedAt = new Date(year, month - 1, day);

    startTransition(() => {
      updateWorkoutAction(workoutId, name, startedAt);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Push Day"
          required
          defaultValue={defaultName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startedAt">Date</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="date"
          required
          defaultValue={defaultDate}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
