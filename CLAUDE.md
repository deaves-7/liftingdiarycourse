# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`)
- **Geist** font family (sans + mono) loaded via `next/font/google`

## Architecture

This is a bare `create-next-app` scaffold — the app has not yet been built out. The entry point is `src/app/page.tsx`. All routes go under `src/app/` using Next.js App Router conventions (layouts, pages, server/client components).

Global styles are in `src/app/globals.css`. The root layout (`src/app/layout.tsx`) sets up fonts and metadata.
