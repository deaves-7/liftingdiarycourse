import { getWorkoutWithExercisesAndSets } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import WorkoutLogger from "./WorkoutLogger";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const id = parseInt(workoutId, 10);

  if (isNaN(id)) notFound();

  const [data, allExercises] = await Promise.all([
    getWorkoutWithExercisesAndSets(id),
    getAllExercises(),
  ]);

  if (!data) notFound();

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{data.workout.name ?? "Workout"}</h1>
        <p className="text-sm text-muted-foreground">
          {format(data.workout.startedAt, "do MMM yyyy")}
        </p>
      </div>

      <WorkoutLogger data={data} allExercises={allExercises} />
    </div>
  );
}
