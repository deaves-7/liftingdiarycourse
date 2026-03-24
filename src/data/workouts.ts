import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import type { Exercise, WorkoutExercise, Set, Workout } from "@/db/schema";

export type WorkoutExerciseWithSets = {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
};

export type WorkoutWithExercisesAndSets = {
  workout: Workout;
  exercises: WorkoutExerciseWithSets[];
};

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt, completedAt: startedAt })
    .returning({ id: workouts.id });

  return workout;
}

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  exercises: string[];
};

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}

export async function updateWorkout(workoutId: number, name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function getWorkoutWithExercisesAndSets(
  workoutId: number
): Promise<WorkoutWithExercisesAndSets | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  if (!workout) return null;

  const rows = await db
    .select({
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order, sets.setNumber);

  const exerciseMap = new Map<number, WorkoutExerciseWithSets>();
  for (const row of rows) {
    if (!exerciseMap.has(row.workoutExercise.id)) {
      exerciseMap.set(row.workoutExercise.id, {
        workoutExercise: row.workoutExercise,
        exercise: row.exercise,
        sets: [],
      });
    }
    if (row.set) {
      exerciseMap.get(row.workoutExercise.id)!.sets.push(row.set);
    }
  }

  return { workout, exercises: Array.from(exerciseMap.values()) };
}

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
