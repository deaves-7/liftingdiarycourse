"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutWithExercises } from "@/data/workouts";

const STORAGE_KEY = "dashboard-selected-date";

export default function WorkoutCalendar({
  workouts,
}: {
  workouts: WorkoutWithExercises[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseISO(stored);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setCalendarMonth(parsed);
      }
    }
  }, []);

  function handleSelect(date: Date) {
    setSelectedDate(date);
    setCalendarMonth(date);
    localStorage.setItem(STORAGE_KEY, format(date, "yyyy-MM-dd"));
  }

  const workoutsForDate = workouts.filter(
    (w) =>
      format(w.startedAt, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && handleSelect(date)}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        className="rounded-lg border"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted-foreground">
            Workouts for{" "}
            <span className="text-foreground font-semibold">
              {format(selectedDate, "do MMM yyyy")}
            </span>
          </h2>
          <Button asChild size="sm">
            <Link
              href={`/dashboard/workout/new?date=${format(selectedDate, "yyyy-MM-dd")}`}
            >
              Log Workout
            </Link>
          </Button>
        </div>

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
                <CardTitle className="text-base">
                  {workout.name ?? "Untitled Workout"}
                </CardTitle>
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
  );
}
