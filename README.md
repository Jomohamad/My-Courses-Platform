# My Courses Platform (منصتي)

A comprehensive educational platform built with Expo (React Native) and Express backend.

## Features

- **Courses & Lessons**: Structured learning content with support for dialogue, video, and text lessons.
- **Interactive Elements**: Quizzes and games (Word Order, Memory, Matching) to reinforce learning.
- **User Progress**: Track completed lessons, quiz scores, and game achievements.
- **Authentication**: Secure login and signup powered by Supabase.
- **Offline Support**: Local caching of course data using AsyncStorage.
- **Cross-Platform**: Runs on Android, iOS, and Web.

## Tech Stack

- **Frontend**: React Native (Expo), TypeScript, Reanimated, Expo Router.
- **Backend API**: Express.js server for handling API requests and serving the web build.
- **Database / Auth**: Supabase.
- **State Management**: TanStack Query & React Context.

## Project Structure

- `app/`: Expo Router screens and navigation.
- `components/`: Reusable UI components.
- `lib/`: Business logic, storage helpers, and Supabase client.
- `server/`: Express backend server.
- `assets/`: Images and fonts.

## Setup & Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file with your Supabase credentials:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run expo:dev
    ```

4.  **Run Backend Server** (Optional for local dev, required for full API features):
    ```bash
    npm run server:dev
    ```

## Building for Production

- **Web**: `npm run expo:static:build`
- **Server**: `npm run server:build`

## License

This project is proprietary software.
