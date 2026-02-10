# منصتي التعليمية - My Courses Platform (Flutter)

A modern, interactive educational platform built with Flutter, designed to deliver engaging courses with dialogues, videos, quizzes, and games.

## Features

-   **Interactive Dialogues**: Chat-based lessons that feel like a conversation.
-   **Video Lessons**: Integrated video player for educational content.
-   **Quizzes**: Test your knowledge with interactive questions and immediate feedback.
-   **Educational Games**: Word ordering and memory games to reinforce learning in a fun way.
-   **Progress Tracking**: Track your completion of lessons and courses.
-   **Gamification**: Earn scores and achievements.

## Tech Stack

-   **Framework**: Flutter (Dart)
-   **State Management**: Flutter Riverpod
-   **Navigation**: GoRouter
-   **Storage**: SharedPreferences (JSON persistence)
-   **Backend (Auth)**: Supabase
-   **UI/Theming**: Material 3, Google Fonts (Cairo)

## Project Structure

```
lib/
├── core/            # Theme, constants, utils
├── data/            # Models, StorageService
├── screens/         # UI Screens (Auth, Home, Course, Lesson, Quiz, Game)
└── main.dart        # Entry point & Routing
```

## Getting Started

### Prerequisites

-   [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.
-   VS Code or Android Studio with Flutter extensions.

### Installation

1.  **Get Dependencies**:
    ```bash
    flutter pub get
    ```

2.  **Run the App**:
    -   Select your device (Chrome, Edge, Android Emulator, or iOS Simulator).
    -   Run:
        ```bash
        flutter run
        ```

## Configuration

-   **Supabase**: The app is configured with placeholder Supabase credentials in `lib/main.dart`. Update them with your own project details to enable real authentication.

## Note

This project was migrated from a React Native codebase to Flutter to provide a more native and performant experience across platforms.
