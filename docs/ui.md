# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do not create custom components. If a UI element is needed, find the appropriate shadcn/ui component.
- Do not write raw HTML elements styled with Tailwind as standalone components (e.g. no custom `<Button>`, `<Card>`, `<Input>` wrappers).
- Install shadcn/ui components via the CLI: `npx shadcn@latest add <component>`
- All installed components live in `src/components/ui/` and must not be modified except when necessary to fix a bug or extend official shadcn/ui variants.

## Date Formatting

Use **date-fns** for all date formatting. Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting method.

### Required Format

Dates must be displayed using ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use the `do MMM yyyy` format token with date-fns `format`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```
