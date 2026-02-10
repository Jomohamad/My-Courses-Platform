import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ionicons/ionicons.dart';
import '../core/theme.dart';
import '../data/storage_service.dart';
import '../data/models.dart';

class GameScreen extends ConsumerStatefulWidget {
  final String lessonId;

  const GameScreen({super.key, required this.lessonId});

  @override
  ConsumerState<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends ConsumerState<GameScreen> {
  @override
  Widget build(BuildContext context) {
    final gamesAsync = ref.watch(lessonGamesProvider(widget.lessonId));

    return Scaffold(
      appBar: AppBar(title: const Text('الألعاب التعليمية')),
      body: gamesAsync.when(
        data: (games) {
          if (games.isEmpty) return const Center(child: Text('لا توجد ألعاب متاحة'));
          
          return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: games.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                  final game = games[index];
                  return _GameCard(game: game);
              },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}

class _GameCard extends StatelessWidget {
    final Game game;

    const _GameCard({required this.game});

    @override
    Widget build(BuildContext context) {
        return Card(
            color: AppColors.backgroundCard,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                        game.type == 'memory' ? Ionicons.grid_outline : Ionicons.text_outline,
                        color: AppColors.accent,
                    ),
                ),
                title: Text(game.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                subtitle: Text(game.type == 'memory' ? 'اختبر ذاكرتك وطابق الكلمات' : 'رتب الكلمات لتكوين جمل', style: const TextStyle(color: AppColors.textSecondary)),
                trailing: const Icon(Ionicons.play_circle, color: AppColors.success, size: 32),
                onTap: () {
                    // Navigate to specific game implementation
                     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('سيتم تشغيل اللعبة... (ميزة قيد التطوير)')));
                },
            ),
        );
    }
}
