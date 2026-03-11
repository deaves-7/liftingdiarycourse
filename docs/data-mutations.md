# Data Mutations

## Server Actions Only

**All data mutations MUST be done via Next.js Server Actions.**

Do NOT mutate data via:
- Route handlers (`src/app/api/`)
- Client-side `fetch` calls
- Any other mechanism outside of server actions

This is a hard rule with no exceptions.

## Colocated `actions.ts` Files

Server actions must be defined in files named `actions.ts`, colocated with the route or feature they serve.

```
src/
  app/
    workouts/
      page.tsx
      actions.ts   # server actions for the workouts route
    workouts/[id]/
      page.tsx
      actions.ts   # server actions for a specific workout
```

Every `actions.ts` file must have `"use server"` at the top.

```ts
"use server";
```

## Database Access via `/data` Helpers

**All database writes MUST go through helper functions in the `src/data/` directory.**

- Helper functions use **Drizzle ORM** exclusively — do NOT write raw SQL
- Never call `db` directly from a server action
- Every helper function that mutates user data MUST scope the operation to the currently authenticated user

### Example structure

```
src/
  data/
    workouts.ts   # read and write helpers for workout data
    exercises.ts  # read and write helpers for exercise data
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function createWorkout(name: string, date: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db.insert(workouts).values({
    userId: session.user.id,
    name,
    date,
  });
}

export async function deleteWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, session.user.id));
}
```

## Typed Parameters — No `FormData`

Server action parameters must be explicitly typed. Do NOT use `FormData` as a parameter type.

```ts
// WRONG
export async function createWorkout(formData: FormData) { ... }

// CORRECT
export async function createWorkout(name: string, date: Date) { ... }
```

## Zod Validation

Every server action MUST validate its arguments with **Zod** before passing them to a data helper.

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.safeParse({ name, date });

  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  await createWorkout(parsed.data.name, parsed.data.date);
}
```

## Authorization

Every data helper that mutates user-owned data **must** verify the authenticated user's ID and scope the write to that user. Never trust a user-supplied ID to identify the owner — always derive the user ID from the server-side session.

A user must never be able to mutate another user's data — not through parameters, URL manipulation, or any other means.
