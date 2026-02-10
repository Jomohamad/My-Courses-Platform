import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ionicons/ionicons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../data/storage_service.dart';
import '../data/models.dart';

class QuizScreen extends ConsumerStatefulWidget {
  final String lessonId;

  const QuizScreen({super.key, required this.lessonId});

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  int _currentIndex = 0;
  int? _selectedOption;
  bool _showResult = false;
  int _score = 0;
  bool _finished = false;

  @override
  Widget build(BuildContext context) {
    final questionsAsync = ref.watch(lessonQuestionsProvider(widget.lessonId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('اختبار قصير'),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => context.pop()),
      ),
      body: questionsAsync.when(
        data: (questions) {
          if (questions.isEmpty) {
            return const Center(child: Text('لا توجد أسئلة لهذا الدرس'));
          }
          
          if (_finished) {
             return _buildFinalResult(questions.length);
          }

          final question = questions[_currentIndex];
          return _buildQuestionView(question, questions.length);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildQuestionView(Question question, int total) {
      return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                  LinearProgressIndicator(
                      value: (_currentIndex + 1) / total,
                      backgroundColor: AppColors.surface,
                      valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                  ),
                  const SizedBox(height: 10),
                  Text('السؤال ${_currentIndex + 1} من $total', style: const TextStyle(color: AppColors.textSecondary), textAlign: TextAlign.end),
                  const SizedBox(height: 32),
                  Text(
                      question.text,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                  ).animate(key: ValueKey(_currentIndex)).fadeIn().slideY(begin: 0.3, end: 0),
                  const Spacer(),
                  ...List.generate(question.options.length, (index) {
                      final option = question.options[index];
                      Color bgColor = AppColors.surface;
                      Color borderColor = Colors.transparent;
                      IconData? icon;
                      
                      if (_showResult) {
                          if (index == question.correctIndex) {
                              borderColor = AppColors.success;
                              bgColor = AppColors.success.withOpacity(0.1);
                              icon = Ionicons.checkmark_circle;
                          } else if (index == _selectedOption) {
                              borderColor = AppColors.error;
                              bgColor = AppColors.error.withOpacity(0.1);
                              icon = Ionicons.close_circle;
                          }
                      } else if (_selectedOption == index) {
                          borderColor = AppColors.primary;
                      }

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: InkWell(
                            onTap: _showResult ? null : () => _handleSelect(index, question),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                    color: bgColor,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: borderColor, width: 2),
                                ),
                                child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                        if (icon != null) Icon(icon, color: borderColor),
                                        Text(option, style: const TextStyle(fontSize: 16)),
                                    ],
                                ),
                            ),
                        ),
                      );
                  }),
                  const Spacer(),
                  if (_showResult)
                      ElevatedButton(
                          onPressed: () => _nextQuestion(total),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: Text(_currentIndex < total - 1 ? 'السؤال التالي' : 'عرض النتيجة', style: const TextStyle(color: Colors.white, fontSize: 16)),
                      ),
              ],
          ),
      );
  }

  Widget _buildFinalResult(int total) {
      final percentage = (_score / total * 100).toInt();
      final isSuccess = percentage >= 50;
      
      return Center(
          child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                  Icon(
                      isSuccess ? Ionicons.trophy : Ionicons.sad_outline,
                      size: 80,
                      color: isSuccess ? AppColors.accent : AppColors.error
                  ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
                  const SizedBox(height: 24),
                  Text(
                      isSuccess ? 'أحسنت!' : 'حاول مرة أخرى',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Text(
                      'لقد أجبت على $_score من $total أسئلة بشكل صحيح',
                      style: const TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 40),
                  ElevatedButton(
                      onPressed: () => context.pop(),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                      ),
                      child: const Text('عودة للدرس', style: TextStyle(color: Colors.white)),
                  ),
              ],
          ),
      );
  }

  void _handleSelect(int index, Question question) {
      setState(() {
          _selectedOption = index;
          _showResult = true;
          if (index == question.correctIndex) {
              _score++;
          }
      });
  }

  void _nextQuestion(int total) {
      if (_currentIndex < total - 1) {
          setState(() {
              _currentIndex++;
              _selectedOption = null;
              _showResult = false;
          });
      } else {
          setState(() {
              _finished = true;
          });
          // Save progress here logic
      }
  }
}
