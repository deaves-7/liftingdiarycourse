"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, startedAt });

  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await createWorkout(parsed.data.name, parsed.data.startedAt);
  redirect("/dashboard");
}
