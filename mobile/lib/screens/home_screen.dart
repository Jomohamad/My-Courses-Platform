import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ionicons/ionicons.dart';
import '../core/theme.dart';
import '../data/storage_service.dart';
import '../data/models.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(coursesProvider);
    final progressAsync = ref.watch(allProgressProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('منصتي التعليمية'),
        leading: IconButton(
          icon: const Icon(Ionicons.add),
          onPressed: () {
            // TODO: Navigate to add course
             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ميزة قادمة قريباً')));
          },
        ),
        actions: [
            Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(child: Text('مرحباً بك', style: Theme.of(context).textTheme.bodySmall)),
          )
        ],
      ),
      body: coursesAsync.when(
        data: (courses) {
            if (courses.isEmpty) {
                 return const Center(child: Text('لا توجد دورات متاحة'));
            }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(coursesProvider.future),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: courses.length,
              itemBuilder: (context, index) {
                final course = courses[index];
                return _CourseCard(course: course, progressList: progressAsync.value ?? []);
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final Course course;
  final List<Progress> progressList;

  const _CourseCard({required this.course, required this.progressList});

  @override
  Widget build(BuildContext context) {
    // Calculate progress (mock logic for now, dependent on lesson relation)
    // In a real app we'd filter progress by lesson IDs belonging to this course
    // limiting for simplicity since we don't have course->lesson id mapping in progress directly without fetching lessons
    double progressPercent = 0.0; 
    
    // Parse hex color
    final color = Color(int.parse(course.color.replaceAll('#', '0xFF')));

    return GestureDetector(
      onTap: () => context.push('/course/${course.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
              colors: [color, AppColors.backgroundCard],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
          ),
          boxShadow: [
             BoxShadow(color: color.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Container(
                    width: 50, height: 50,
                    decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(16)
                    ),
                    child: Icon(_getIconData(course.icon), color: Colors.white, size: 28),
                   ),
                   Row(
                       children: [
                           Text('${course.lessonsCount} حصة', style: TextStyle(color: AppColors.textSecondary)),
                           const SizedBox(width: 4),
                           const Icon(Ionicons.layers_outline, size: 14, color: AppColors.textSecondary),
                       ],
                   )
                ],
              ),
              const SizedBox(height: 12),
              Text(course.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 6),
              Text(course.description, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis, textAlign: TextAlign.right),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text('${(progressPercent * 100).toInt()}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(value: progressPercent, backgroundColor: Colors.white.withOpacity(0.1), valueColor: AlwaysStoppedAnimation(color), minHeight: 6),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  IconData _getIconData(String name) {
      switch(name) {
          case 'code-slash': return Ionicons.code_slash;
          case 'globe-outline': return Ionicons.globe_outline;
          case 'calculator-outline': return Ionicons.calculator_outline;
          case 'book-outline': return Ionicons.book_outline;
          case 'flask-outline': return Ionicons.flask_outline;
          default: return Ionicons.book_outline;
      }
  }
}
