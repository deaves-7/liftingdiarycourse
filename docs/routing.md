# Routing Standards

## Route Structure

All app routes must live under `/dashboard`. There are no public-facing pages beyond the auth flow (sign-in, sign-up).

```
/dashboard          → main dashboard
/dashboard/[...]    → all sub-pages
```

## Route Protection

All `/dashboard` routes are protected and require an authenticated user.

- **Protection is implemented exclusively via Next.js middleware** (`src/middleware.ts`).
- Do not add auth checks inside page components or layouts. The middleware is the single enforcement point.
- The middleware must redirect unauthenticated users to the sign-in page before the route renders.

### Middleware Pattern

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = /* read session token from cookies */;

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

The `matcher` must cover `/dashboard` and all sub-paths (`/dashboard/:path*`).

## File Conventions

Follow Next.js App Router conventions under `src/app/`:

```
src/app/
  dashboard/
    page.tsx          → /dashboard
    layout.tsx        → shared dashboard layout (optional)
    workouts/
      page.tsx        → /dashboard/workouts
      [id]/
        page.tsx      → /dashboard/workouts/[id]
```

- Every route segment is a directory with a `page.tsx`.
- Shared UI for dashboard routes belongs in `src/app/dashboard/layout.tsx`.
- Do not place dashboard routes outside of `src/app/dashboard/`.
