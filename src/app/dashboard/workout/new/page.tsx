"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { createWorkoutAction } from "./actions";

export default function NewWorkoutPage() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const defaultDate =
    searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const dateStr = (form.elements.namedItem("startedAt") as HTMLInputElement).value;
    const [year, month, day] = dateStr.split("-").map(Number);
    const startedAt = new Date(year, month - 1, day);

    startTransition(() => {
      createWorkoutAction(name, startedAt);
    });
  }

  return (
    <div className="container mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Push Day"
                required
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
              {isPending ? "Creating..." : "Create Workout"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
