"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Plus, ChevronsUpDown } from "lucide-react";
import type { Exercise } from "@/db/schema";
import type { WorkoutWithExercisesAndSets } from "@/data/workouts";
import {
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  updateSetAction,
  deleteSetAction,
} from "./actions";

type Props = {
  data: WorkoutWithExercisesAndSets;
  allExercises: Exercise[];
};

export default function WorkoutLogger({ data, allExercises }: Props) {
  const { workout, exercises } = data;
  const [isPending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const selectedExercise = allExercises.find((e) => e.id === selectedExerciseId);

  function handleAddExercise() {
    if (!selectedExerciseId) return;
    startTransition(async () => {
      await addExerciseToWorkoutAction(workout.id, selectedExerciseId);
      setSelectedExerciseId(null);
    });
  }

  function handleRemoveExercise(workoutExerciseId: number) {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction(workoutExerciseId, workout.id);
    });
  }

  function handleAddSet(workoutExerciseId: number) {
    startTransition(async () => {
      await addSetAction(workoutExerciseId, workout.id, null, null);
    });
  }

  function handleDeleteSet(setId: number) {
    startTransition(async () => {
      await deleteSetAction(setId, workout.id);
    });
  }

  function handleSetBlur(
    setId: number,
    reps: number | null,
    weightLbs: string | null
  ) {
    startTransition(async () => {
      await updateSetAction(setId, workout.id, reps, weightLbs);
    });
  }

  return (
    <div className="space-y-4">
      {exercises.map(({ workoutExercise, exercise, sets }) => (
        <Card key={workoutExercise.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={() => handleRemoveExercise(workoutExercise.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Set</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead>Weight (lbs)</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sets.map((set) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    isPending={isPending}
                    onBlur={handleSetBlur}
                    onDelete={handleDeleteSet}
                  />
                ))}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleAddSet(workoutExercise.id)}
            >
              <Plus className="size-4 mr-1" />
              Add Set
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Add Exercise */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm font-medium mb-2">Add Exercise</p>
          <div className="flex gap-2">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={pickerOpen}
                  className="flex-1 justify-between"
                >
                  {selectedExercise ? selectedExercise.name : "Search exercises..."}
                  <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search exercises..." />
                  <CommandList>
                    <CommandEmpty>No exercises found.</CommandEmpty>
                    <CommandGroup>
                      {allExercises.map((exercise) => (
                        <CommandItem
                          key={exercise.id}
                          value={exercise.name}
                          onSelect={() => {
                            setSelectedExerciseId(exercise.id);
                            setPickerOpen(false);
                          }}
                        >
                          {exercise.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              disabled={!selectedExerciseId || isPending}
              onClick={handleAddExercise}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type SetRowProps = {
  set: {
    id: number;
    setNumber: number;
    reps: number | null;
    weightLbs: string | null;
  };
  isPending: boolean;
  onBlur: (setId: number, reps: number | null, weightLbs: string | null) => void;
  onDelete: (setId: number) => void;
};

function SetRow({ set, isPending, onBlur, onDelete }: SetRowProps) {
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weightLbs ?? "");

  function handleBlur() {
    const parsedReps = reps !== "" ? parseInt(reps, 10) : null;
    const parsedWeight = weight !== "" ? weight : null;
    onBlur(set.id, parsedReps, parsedWeight);
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{set.setNumber}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={1}
          className="h-8 w-20"
          placeholder="—"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={handleBlur}
          disabled={isPending}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          step="0.5"
          className="h-8 w-24"
          placeholder="—"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleBlur}
          disabled={isPending}
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => onDelete(set.id)}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
