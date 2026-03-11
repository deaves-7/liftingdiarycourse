# Auth Coding Standards

## Authentication Provider

**This app uses [Clerk](https://clerk.com) for all authentication.**

- Do NOT use NextAuth, Auth.js, custom JWT logic, or any other auth library
- Do NOT implement custom session management or token handling
- All auth-related functionality must go through Clerk's official SDK

## Installation & Setup

Clerk is configured via the `@clerk/nextjs` package.

The `<ClerkProvider>` must wrap the entire app in the root layout (`src/app/layout.tsx`).

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Middleware

Route protection is handled via Clerk middleware in `src/middleware.ts`.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- Public routes (landing page, sign-in, sign-up) must be explicitly listed in `isPublicRoute`
- All other routes are protected by default

## Reading the Current User (Server Components)

Use Clerk's `auth()` helper from `@clerk/nextjs/server` to get the current user's ID in server components and data helpers.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");
```

- Always `await auth()` — it is async
- Always check that `userId` is non-null before proceeding
- Never trust a user-supplied ID — always derive the user ID from `auth()`

## Reading the Current User (Client Components)

Use Clerk's `useAuth` or `useUser` hooks in client components.

```tsx
"use client";
import { useUser } from "@clerk/nextjs";

export function ProfileBadge() {
  const { user } = useUser();
  return <span>{user?.firstName}</span>;
}
```

- Use `useUser` for display info (name, avatar, email)
- Use `useAuth` for the `userId` or auth state
- Never fetch sensitive user data from client components — use server components for that

## Sign In / Sign Up UI

Use Clerk's prebuilt components. Do NOT build custom sign-in or sign-up forms.

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

- Sign-in page: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Sign-up page: `src/app/sign-up/[[...sign-up]]/page.tsx`

## User Button

Use Clerk's `<UserButton>` for the account/profile menu. Do NOT build a custom dropdown.

```tsx
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <UserButton />
    </header>
  );
}
```

## Environment Variables

Clerk requires the following environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

- Never hardcode these values
- Never commit the secret key to source control
- The `NEXT_PUBLIC_` prefix is required for the publishable key so the browser can access it
