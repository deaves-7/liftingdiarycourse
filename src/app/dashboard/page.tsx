import { getWorkoutsForCurrentUser } from "@/data/workouts";
import WorkoutCalendar from "./WorkoutCalendar";

export default async function DashboardPage() {
  const workouts = await getWorkoutsForCurrentUser();

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <WorkoutCalendar workouts={workouts} />
    </div>
  );
}
