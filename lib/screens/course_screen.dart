import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ionicons/ionicons.dart';
import '../core/theme.dart';
import '../data/storage_service.dart';
import '../data/models.dart';

class CourseScreen extends ConsumerWidget {
  final String courseId;

  const CourseScreen({super.key, required this.courseId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(coursesProvider.select((v) => v.whenData((courses) => courses.firstWhere((c) => c.id == courseId))));
    final lessonsAsync = ref.watch(courseLessonsProvider(courseId));

    return Scaffold(
        body: courseAsync.when(
            data: (course) => CustomScrollView(
                slivers: [
                    SliverAppBar(
                        expandedHeight: 200,
                        pinned: true,
                        flexibleSpace: FlexibleSpaceBar(
                            title: Text(course.title, style: const TextStyle(color: Colors.white)),
                            background: Container(
                                decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                        colors: [Color(int.parse(course.color.replaceAll('#', '0xFF'))), AppColors.background],
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                    ),
                                ),
                                child: Center(
                                    child: Icon(Ionicons.book, size: 64, color: Colors.white.withOpacity(0.3)),
                                ),
                            ),
                        ),
                    ),
                    SliverToBoxAdapter(
                        child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                    Text(course.description, style: const TextStyle(color: AppColors.textSecondary, height: 1.5), textAlign: TextAlign.right),
                                    const SizedBox(height: 24),
                                    const Text('الحصص', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                                ],
                            ),
                        ),
                    ),
                   lessonsAsync.when(
                        data: (lessons) {
                            if (lessons.isEmpty) {
                                return const SliverFillRemaining(child: Center(child: Text('لا توجد حصص بعد', style: TextStyle(color: AppColors.textMuted))));
                            }
                            return SliverList(
                                delegate: SliverChildBuilderDelegate(
                                    (context, index) {
                                        final lesson = lessons[index];
                                        return _LessonItem(lesson: lesson, index: index);
                                    },
                                    childCount: lessons.length,
                                ),
                            );
                        },
                        loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator())),
                        error: (err, _) => SliverFillRemaining(child: Center(child: Text('Error: $err'))),
                   )
                ],
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Course not found')),
        ),
    );
  }
}

class _LessonItem extends StatelessWidget {
    final Lesson lesson;
    final int index;

    const _LessonItem({required this.lesson, required this.index});

    @override
    Widget build(BuildContext context) {
        return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            child: InkWell(
                onTap: () => context.push('/lesson/${lesson.id}', extra: lesson),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        color: AppColors.backgroundCard,
                        borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                        children: [
                            Icon(Ionicons.chevron_back, color: AppColors.textMuted),
                            const Spacer(),
                            Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                    Text(lesson.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                                    const SizedBox(height: 4),
                                    Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                            Text(lesson.type == 'dialogue' ? 'حوار' : 'فيديو', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                            const SizedBox(width: 4),
                                            Icon(
                                                lesson.type == 'dialogue' ? Ionicons.chatbubbles_outline : Ionicons.videocam_outline,
                                                size: 14,
                                                color: AppColors.primary
                                            ),
                                        ],
                                    )
                                ],
                            ),
                             const SizedBox(width: 14),
                             Container(
                                 width: 36, height: 36,
                                 decoration: BoxDecoration(
                                     color: AppColors.surface,
                                     borderRadius: BorderRadius.circular(12),
                                 ),
                                 child: Center(child: Text('${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold))),
                             ),
                        ],
                    ),
                ),
            ),
        );
    }
}
