import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/theme.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'screens/course_screen.dart';
import 'screens/lesson_screen.dart';
import 'screens/quiz_screen.dart';
import 'screens/game_screen.dart';
import 'data/models.dart';

// GoRouter configuration
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const AuthScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/course/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return CourseScreen(courseId: id);
      },
    ),
    GoRoute(
      path: '/lesson/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final lesson = state.extra as Lesson?;
        return LessonScreen(lessonId: id, lessonObj: lesson);
      },
    ),
    GoRoute(
      path: '/quiz/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return QuizScreen(lessonId: id);
      },
    ),
    GoRoute(
      path: '/game/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return GameScreen(lessonId: id);
      },
    ),
  ],
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  // Note: Replace with your actual project URL and Anon Key
  await Supabase.initialize(
    url: 'https://placeholder-url.supabase.co', 
    anonKey: 'placeholder-anon-key',
  );

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'My Courses Platform',
      debugShowCheckedModeBanner: false,
      theme: appTheme,
      routerConfig: _router,
      builder: (context, child) {
        return Directionality(
            textDirection: TextDirection.rtl,
            child: child!,
        );
      },
    );
  }
}
