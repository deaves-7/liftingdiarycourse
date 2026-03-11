import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning({ id: workouts.id });

  return workout;
}

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  exercises: string[];
};

export async function getWorkoutsForCurrentUser(): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt, workoutExercises.order);

  const map = new Map<number, WorkoutWithExercises>();
  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}
