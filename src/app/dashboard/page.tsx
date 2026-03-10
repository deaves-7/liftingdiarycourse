"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockWorkouts = [
  {
    id: 1,
    name: "Morning Push",
    date: new Date(2026, 2, 6),
    exercises: ["Bench Press", "Overhead Press", "Tricep Dips"],
  },
  {
    id: 2,
    name: "Cardio Session",
    date: new Date(2026, 2, 6),
    exercises: ["Treadmill", "Jump Rope"],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 6));

  const workoutsForDate = mockWorkouts.filter(
    (w) =>
      format(w.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-lg border"
        />

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            Workouts for{" "}
            <span className="text-foreground font-semibold">
              {format(selectedDate, "do MMM yyyy")}
            </span>
          </h2>

          {workoutsForDate.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : (
            workoutsForDate.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workout.exercises.map((exercise) => (
                      <Badge key={exercise} variant="secondary">
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
