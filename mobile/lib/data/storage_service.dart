import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';

// Mock Data Seeder
final sampleCourses = [
  Course(
    id: 'c1',
    title: 'اللغة الإنجليزية للمبتدئين',
    description: 'تعلم أساسيات اللغة الإنجليزية من الصفر حتى الاحتراف',
    color: '#0A8F8F',
    icon: 'book-outline',
    lessonsCount: 3,
    createdAt: DateTime.now().millisecondsSinceEpoch,
  ),
   Course(
    id: 'c2',
    title: 'الرياضيات الممتعة',
    description: 'شرح مبسط لقواعد الرياضيات والعمليات الحسابية',
    color: '#F5A623',
    icon: 'calculator-outline',
    lessonsCount: 0,
    createdAt: DateTime.now().millisecondsSinceEpoch,
  ),
];

final sampleLessons = [
  Lesson(
    id: 'l1',
    courseId: 'c1',
    title: 'التعارف والتحية',
    type: 'dialogue',
    order: 1,
    content: [
      DialogueMessage(id: 'm1', sender: 'robot', text: 'أهلاً بك! أنا "روبوت"، معلمك الذكي.'),
      DialogueMessage(id: 'm2', sender: 'robot', text: 'سنتعلم اليوم كيف نلقي التحية باللغة الإنجليزية.'),
      DialogueMessage(id: 'm3', sender: 'user', text: 'مرحباً! أنا متحمس للبدء.'),
      DialogueMessage(id: 'm4', sender: 'robot', text: 'رائع! لنبدأ بكلمة "Hello" والتي تعني "مرحباً".'),
    ],
    createdAt: DateTime.now().millisecondsSinceEpoch,
  ),
  Lesson(
    id: 'l2',
    courseId: 'c1',
    title: 'الأرقام من 1 إلى 10',
    type: 'video',
    order: 2,
    videoUrl: 'https://www.youtube.com/watch?v=ea5-SIe5l7M',
    createdAt: DateTime.now().millisecondsSinceEpoch,
  ),
  Lesson(
    id: 'l3',
    courseId: 'c1',
    title: 'الألوان الأساسية',
    type: 'dialogue',
    order: 3,
    content: [
      DialogueMessage(id: 'm1', sender: 'robot', text: 'سنتعلم اليوم الألوان.'),
    ],
    createdAt: DateTime.now().millisecondsSinceEpoch,
  ),
];

final sampleQuestions = [
  Question(
    id: 'q1',
    lessonId: 'l1',
    text: 'ما معنى كلمة "Hello"؟',
    options: ['وداعاً', 'مرحباً', 'شكراً', 'صباح الخير'],
    correctIndex: 1,
    order: 1,
  ),
    Question(
    id: 'q2',
    lessonId: 'l1',
    text: 'كيف تقول "صباح الخير"؟',
    options: ['Good Night', 'Good Evening', 'Good Morning', 'Hello'],
    correctIndex: 2,
    order: 2,
  ),
];

final sampleGames = [
   Game(
    id: 'g1',
    lessonId: 'l1',
    type: 'word-order',
    title: 'رتب الجملة',
    data: {
      'sentence': 'My name is Sarah',
      'words': ['is', 'name', 'Sarah', 'My'],
    },
  ),
  Game(
    id: 'g2',
    lessonId: 'l1',
    type: 'memory',
    title: 'لعبة الذاكرة',
    data: {
      'pairs': [
        {'term': 'Hello', 'definition': 'مرحباً'},
         {'term': 'Good Bye', 'definition': 'وداعاً'},
      ],
    },
  ),
];

class StorageService {
  static const _kCourses = 'courses';
  static const _kLessons = 'lessons';
  static const _kQuestions = 'questions';
  static const _kGames = 'games';
  static const _kProgress = 'progress';
  static const _kSeeded = 'seeded_v1';

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey(_kSeeded)) {
      await _seedData(prefs);
    }
  }

  Future<void> _seedData(SharedPreferences prefs) async {
    await prefs.setString(_kCourses, jsonEncode(sampleCourses));
    await prefs.setString(_kLessons, jsonEncode(sampleLessons));
    await prefs.setString(_kQuestions, jsonEncode(sampleQuestions));
    await prefs.setString(_kGames, jsonEncode(sampleGames));
    await prefs.setBool(_kSeeded, true);
  }

  Future<List<Course>> getCourses() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kCourses);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json.map((e) => Course.fromJson(e)).toList();
  }

  Future<Course?> getCourse(String id) async {
    final courses = await getCourses();
    try {
      return courses.firstWhere((c) => c.id == id);
    } catch (e) {
      return null;
    }
  }

  Future<List<Lesson>> getLessons(String courseId) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kLessons);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json
        .map((e) => Lesson.fromJson(e))
        .where((l) => l.courseId == courseId)
        .toList();
  }

  Future<Lesson?> getLesson(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kLessons);
    if (jsonStr == null) return null;
    final List<dynamic> json = jsonDecode(jsonStr);
    try {
      return json.map((e) => Lesson.fromJson(e)).firstWhere((l) => l.id == id);
    } catch (e) {
      return null;
    }
  }

  Future<List<Question>> getQuestions(String lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kQuestions);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json
        .map((e) => Question.fromJson(e))
        .where((q) => q.lessonId == lessonId)
        .toList();
  }
  
  Future<List<Game>> getGames(String lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kGames);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json
        .map((e) => Game.fromJson(e))
        .where((g) => g.lessonId == lessonId)
        .toList();
  }

  Future<List<Progress>> getProgress(String lessonId) async {
     final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kProgress);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json
        .map((e) => Progress.fromJson(e))
        .where((p) => p.lessonId == lessonId)
        .toList();
  }

  Future<List<Progress>> getAllProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_kProgress);
    if (jsonStr == null) return [];
    final List<dynamic> json = jsonDecode(jsonStr);
    return json.map((e) => Progress.fromJson(e)).toList();
  }

  Future<void> setProgress(Progress progress) async {
    final prefs = await SharedPreferences.getInstance();
    final allProgress = await getAllProgress();
    
    // Remove existing progress for this lesson to update it
    allProgress.removeWhere((p) => p.lessonId == progress.lessonId);
    allProgress.add(progress);
    
    await prefs.setString(_kProgress, jsonEncode(allProgress));
  }
}

final storageServiceProvider = Provider((ref) => StorageService());

final coursesProvider = FutureProvider((ref) async {
  final storage = ref.watch(storageServiceProvider);
  await storage.init();
  return storage.getCourses();
});

final courseLessonsProvider = FutureProvider.family<List<Lesson>, String>((ref, courseId) async {
  final storage = ref.watch(storageServiceProvider);
  return storage.getLessons(courseId);
});

final lessonQuestionsProvider = FutureProvider.family<List<Question>, String>((ref, lessonId) async {
    final storage = ref.watch(storageServiceProvider);
    return storage.getQuestions(lessonId);
});

final lessonGamesProvider = FutureProvider.family<List<Game>, String>((ref, lessonId) async {
    final storage = ref.watch(storageServiceProvider);
    return storage.getGames(lessonId);
});

final allProgressProvider = FutureProvider((ref) async {
    final storage = ref.watch(storageServiceProvider);
    return storage.getAllProgress();
});
