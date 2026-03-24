"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/workout-exercises";
import { addSet, updateSet, deleteSet } from "@/data/sets";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(workoutId: number, exerciseId: number) {
  const parsed = addExerciseSchema.safeParse({ workoutId, exerciseId });
  if (!parsed.success) throw new Error("Invalid input");

  await addExerciseToWorkout(parsed.data.workoutId, parsed.data.exerciseId);
  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(
  workoutExerciseId: number,
  workoutId: number
) {
  const parsed = removeExerciseSchema.safeParse({ workoutExerciseId, workoutId });
  if (!parsed.success) throw new Error("Invalid input");

  await removeExerciseFromWorkout(parsed.data.workoutExerciseId);
  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weightLbs: z.string().nullable(),
});

export async function addSetAction(
  workoutExerciseId: number,
  workoutId: number,
  reps: number | null,
  weightLbs: string | null
) {
  const parsed = addSetSchema.safeParse({ workoutExerciseId, workoutId, reps, weightLbs });
  if (!parsed.success) throw new Error("Invalid input");

  await addSet(parsed.data.workoutExerciseId, parsed.data.reps, parsed.data.weightLbs);
  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weightLbs: z.string().nullable(),
});

export async function updateSetAction(
  setId: number,
  workoutId: number,
  reps: number | null,
  weightLbs: string | null
) {
  const parsed = updateSetSchema.safeParse({ setId, workoutId, reps, weightLbs });
  if (!parsed.success) throw new Error("Invalid input");

  await updateSet(parsed.data.setId, parsed.data.reps, parsed.data.weightLbs);
  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function deleteSetAction(setId: number, workoutId: number) {
  const parsed = deleteSetSchema.safeParse({ setId, workoutId });
  if (!parsed.success) throw new Error("Invalid input");

  await deleteSet(parsed.data.setId);
  revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
}

