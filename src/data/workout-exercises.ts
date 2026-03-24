import { db } from "@/db";
import { workoutExercises, workouts } from "@/db/schema";
import { and, eq, max } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function addExerciseToWorkout(workoutId: number, exerciseId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Verify the workout belongs to the current user
  const [workout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  if (!workout) throw new Error("Workout not found");

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const order = (maxOrder ?? 0) + 1;

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning({ id: workoutExercises.id });

  return workoutExercise;
}

export async function removeExerciseFromWorkout(workoutExerciseId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Verify ownership via join
  const [row] = await db
    .select({ workoutUserId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(eq(workoutExercises.id, workoutExerciseId));

  if (!row || row.workoutUserId !== userId) throw new Error("Not found");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}
