import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

async function verifyWorkoutExerciseOwnership(workoutExerciseId: number, userId: string) {
  const [row] = await db
    .select({ workoutUserId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(eq(workoutExercises.id, workoutExerciseId));

  if (!row || row.workoutUserId !== userId) throw new Error("Not found");
}

async function verifySetOwnership(setId: number, userId: string) {
  const [row] = await db
    .select({ workoutUserId: workouts.userId })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(eq(sets.id, setId));

  if (!row || row.workoutUserId !== userId) throw new Error("Not found");
}

export async function addSet(
  workoutExerciseId: number,
  reps: number | null,
  weightLbs: string | null
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await verifyWorkoutExerciseOwnership(workoutExerciseId, userId);

  const [{ maxSetNumber }] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const setNumber = (maxSetNumber ?? 0) + 1;

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weightLbs })
    .returning({ id: sets.id });

  return set;
}

export async function updateSet(
  setId: number,
  reps: number | null,
  weightLbs: string | null
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await verifySetOwnership(setId, userId);

  await db.update(sets).set({ reps, weightLbs }).where(eq(sets.id, setId));
}

export async function deleteSet(setId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await verifySetOwnership(setId, userId);

  await db.delete(sets).where(eq(sets.id, setId));
}
