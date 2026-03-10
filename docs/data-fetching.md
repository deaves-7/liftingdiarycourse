# Data Fetching

## Server Components Only

**All data fetching MUST be done exclusively Server Components.**

Do NOT fetch data via:
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any other client-side data fetching library
- Any other mechanism outside of server components

This is a hard rule with no exceptions.

## Database Access via `/data` Helpers

**All database queries MUST go through helper functions in the `/data` directory.**

- Helper functions use **Drizzle ORM** exclusively — do NOT write raw SQL
- Never query the database directly from a page or component
- Every helper function that fetches user data MUST scope the query to the currently authenticated user

### Example structure

```
src/
  data/
    workouts.ts   # helper functions for workout data
    exercises.ts  # helper functions for exercise data
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getWorkoutsForCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

### Example server component usage

```tsx
// src/app/dashboard/page.tsx
import { getWorkoutsForCurrentUser } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkoutsForCurrentUser();
  return <WorkoutList workouts={workouts} />;
}
```

## Authorization

Every helper function that returns user-owned data **must** verify the authenticated user's ID and filter results by that ID. A user must never be able to access another user's data — not through parameters, not through URL manipulation, not through any other means.

Never trust user-supplied IDs to scope data. Always derive the user ID from the server-side session.
