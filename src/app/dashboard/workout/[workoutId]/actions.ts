"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function updateWorkoutAction(
  workoutId: number,
  name: string,
  startedAt: Date
) {
  const parsed = updateWorkoutSchema.safeParse({ workoutId, name, startedAt });

  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await updateWorkout(parsed.data.workoutId, parsed.data.name, parsed.data.startedAt);
  redirect("/dashboard");
}
