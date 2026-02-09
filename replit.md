# Replit Agent Configuration

## Overview

This is an Arabic-language educational platform called "منصتي" (My Platform) built as a React Native / Expo mobile application with an Express.js backend server. The app allows users to create and manage courses, lessons (dialogue-based or video), quizzes, and educational games (word ordering and memory matching). The app features a dark-themed UI with RTL support for Arabic content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Mobile App)
- **Framework**: React Native with Expo SDK 54, using the new architecture (`newArchEnabled: true`)
- **Routing**: Expo Router (file-based routing) with typed routes. Routes are defined in the `app/` directory:
  - `app/index.tsx` - Home screen showing course list with progress
  - `app/course/[id].tsx` - Course detail with lesson list
  - `app/lesson/[id].tsx` - Lesson viewer (dialogue bubbles with animations)
  - `app/quiz/[lessonId].tsx` - Quiz screen (multiple choice questions)
  - `app/game/[lessonId].tsx` - Game screen (word-order and memory games)
  - `app/add-course.tsx`, `app/add-lesson.tsx`, `app/add-question.tsx`, `app/add-game.tsx` - Modal screens for creating content
- **State Management**: React Query (`@tanstack/react-query`) for server state, local React state for UI
- **Data Storage (Client-side)**: AsyncStorage (`@react-native-async-storage/async-storage`) is used for local data persistence. The `lib/storage.ts` module handles all CRUD operations, seed data, and progress tracking locally on the device.
- **Fonts**: Cairo font family (Arabic-optimized) via `@expo-google-fonts/cairo`
- **UI Libraries**: expo-linear-gradient, expo-haptics, expo-blur, react-native-reanimated, react-native-gesture-handler
- **Styling**: Dark theme defined in `constants/colors.ts` with a navy/teal color palette

### Backend (Express Server)
- **Framework**: Express.js v5 running on Node.js
- **Entry Point**: `server/index.ts`
- **Routes**: `server/routes.ts` - Currently minimal, designed for API routes prefixed with `/api`
- **Storage Layer**: `server/storage.ts` - Uses in-memory storage (`MemStorage` class) with a `Map` for users. Implements an `IStorage` interface for easy swapping to a database-backed implementation.
- **CORS**: Configured to allow Replit dev domains and localhost origins for Expo web development
- **Build**: Server is bundled with esbuild for production (`server:build` script)

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Current Tables**:
  - `users` - id (UUID, auto-generated), username (unique), password
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Output to `./migrations` directory
- **Note**: The database schema is minimal. Most app data (courses, lessons, questions, games, progress) is currently stored client-side in AsyncStorage via `lib/storage.ts` and `lib/types.ts`. The PostgreSQL database with Drizzle is set up but underutilized — only a users table exists.

### Data Types (Client-side)
Defined in `lib/types.ts`:
- **Course**: id, title, description, color, icon, lessonsCount, createdAt
- **Lesson**: id, courseId, title, type (dialogue/video), order, content (DialogueMessage[]), videoUrl
- **Question**: id, lessonId, text, options[], correctIndex, order
- **Game**: id, lessonId, type (word-order/memory), title, data (WordOrderData | MemoryData)
- **DialogueMessage**: id, sender (robot/user), text
- **Progress**: tracking lesson completion

### Key Design Decisions
1. **Local-first storage**: All educational content is stored in AsyncStorage on the device, with seed data loaded on first launch (tracked by `seeded_v2` key). This means the app works offline but data doesn't sync across devices.
2. **Shared schema directory**: The `shared/` directory contains code shared between frontend and backend (currently just the Drizzle schema).
3. **Path aliases**: `@/*` maps to project root, `@shared/*` maps to `./shared/*` (configured in tsconfig.json).
4. **Development workflow**: Two dev processes run simultaneously — `expo:dev` for the mobile app and `server:dev` for the Express backend. The Expo app proxies API calls to the Express server.
5. **Production build**: Uses a custom build script (`scripts/build.js`) that starts Metro bundler, fetches the bundle, and saves static assets. The server serves both the API and static web build in production.

## External Dependencies

### Core Services
- **PostgreSQL**: Database provisioned via Replit, connected through `DATABASE_URL` environment variable. Used with Drizzle ORM.
- **Replit Hosting**: The app is designed to run on Replit with environment variables like `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and `REPLIT_INTERNAL_APP_DOMAIN`.

### Key NPM Packages
- **expo** (~54.0.27) - Core mobile framework
- **expo-router** (~6.0.17) - File-based routing
- **express** (^5.0.1) - Backend HTTP server
- **drizzle-orm** (^0.39.3) + **drizzle-kit** - Database ORM and migration tool
- **@tanstack/react-query** (^5.83.0) - Async state management
- **pg** (^8.16.3) - PostgreSQL client
- **zod** + **drizzle-zod** - Schema validation
- **react-native-reanimated** (~4.1.1) - Animations
- **expo-haptics** - Haptic feedback
- **expo-image-picker** - Image selection
- **expo-av** - Audio/video playback
- **patch-package** - Applied via postinstall script for patching dependencies