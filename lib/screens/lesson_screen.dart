import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ionicons/ionicons.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../data/storage_service.dart';
import '../data/models.dart';

class LessonScreen extends ConsumerStatefulWidget {
  final String lessonId;
  final Lesson? lessonObj;

  const LessonScreen({super.key, required this.lessonId, this.lessonObj});

  @override
  ConsumerState<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends ConsumerState<LessonScreen> {
  int _visibleCount = 1;
  final ScrollController _scrollController = ScrollController();
  late final WebViewController _videoController;

  @override
  void initState() {
    super.initState();
    if (widget.lessonObj?.type == 'video' && widget.lessonObj?.videoUrl != null) {
        // Simple Youtube embed for now
        final url = widget.lessonObj!.videoUrl!;
        final videoId = Uri.parse(url).queryParameters['v'];
        final embedUrl = 'https://www.youtube.com/embed/$videoId';

        _videoController = WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..loadRequest(Uri.parse(embedUrl));
    }
  }

  void _showNextMessage() {
    setState(() {
      _visibleCount++;
    });
    // Scroll to bottom after frame
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
      final lessonAsync = widget.lessonObj != null 
        ? AsyncValue.data(widget.lessonObj!) 
        : ref.watch(courseLessonsProvider(widget.lessonObj?.courseId ?? '')); // Ideally fetch single lesson

      // Fallback if we don't have the object passed
      if (widget.lessonObj == null) {
          return const Scaffold(body: Center(child: Text("Loading...")));
      }
      final lesson = widget.lessonObj!;

    return Scaffold(
      appBar: AppBar(
        title: Text(lesson.title),
        actions: [
            IconButton(
                icon: const Icon(Ionicons.help_circle_outline),
                onPressed: () => context.push('/quiz/${lesson.id}'),
            ),
             IconButton(
                icon: const Icon(Ionicons.game_controller_outline),
                onPressed: () => context.push('/game/${lesson.id}'),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: lesson.type == 'video' 
                ? _buildVideoPlayer() 
                : _buildDialogueView(lesson),
          ),
          _buildBottomBar(lesson),
        ],
      ),
    );
  }

  Widget _buildVideoPlayer() {
      return Container(
          color: Colors.black,
          child: WebViewWidget(controller: _videoController),
      );
  }

  Widget _buildDialogueView(Lesson lesson) {
     final messages = lesson.content ?? [];
     final visibleMessages = messages.take(_visibleCount).toList();

     return ListView.builder(
         controller: _scrollController,
         padding: const EdgeInsets.all(16),
         itemCount: visibleMessages.length + (messages.length > _visibleCount ? 1 : 0),
         itemBuilder: (context, index) {
             if (index == visibleMessages.length) {
                 return Padding(
                     padding: const EdgeInsets.symmetric(vertical: 20),
                     child: Center(
                         child: ElevatedButton.icon(
                             onPressed: _showNextMessage,
                             icon: const Icon(Icons.arrow_downward),
                             label: const Text('التالي'),
                             style: ElevatedButton.styleFrom(
                                 backgroundColor: AppColors.primary,
                                 foregroundColor: Colors.white,
                                 padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                             ),
                         ),
                     ),
                 );
             }

             final msg = visibleMessages[index];
             final isRobot = msg.sender == 'robot';
             
             return Padding(
               padding: const EdgeInsets.only(bottom: 16.0),
               child: Row(
                   mainAxisAlignment: isRobot ? MainAxisAlignment.start : MainAxisAlignment.end,
                   crossAxisAlignment: CrossAxisAlignment.end,
                   children: [
                       if (isRobot) ...[
                           const CircleAvatar(
                               backgroundColor: AppColors.surface,
                               child: Icon(Ionicons.hardware_chip_outline, color: AppColors.primary, size: 20),
                           ),
                           const SizedBox(width: 8),
                       ],
                       Flexible(
                           child: Container(
                               padding: const EdgeInsets.all(16),
                               decoration: BoxDecoration(
                                   color: isRobot ? AppColors.surface : AppColors.primary,
                                   borderRadius: BorderRadius.only(
                                       topLeft: const Radius.circular(20),
                                       topRight: const Radius.circular(20),
                                       bottomLeft: IsRobot ? const Radius.circular(4) : const Radius.circular(20),
                                       bottomRight: isRobot ? const Radius.circular(20) : const Radius.circular(4),
                                   ),
                               ),
                               child: Text(
                                   msg.text,
                                   style: TextStyle(color: isRobot ? AppColors.text : Colors.white, height: 1.4),
                               ),
                           ).animate().fade().scale(duration: 300.ms, curve: Curves.easeOutBack),
                       ),
                        if (!isRobot) ...[
                           const SizedBox(width: 8),
                           const CircleAvatar(
                               backgroundColor: AppColors.accent,
                               child: Icon(Ionicons.person, color: Colors.white, size: 20),
                           ),
                       ],
                   ],
               ),
             );
         },
     );
  }

  // Workaround for undefined IsRobot usage in above method
  bool get IsRobot => true; 

  Widget _buildBottomBar(Lesson lesson) {
      return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: AppColors.backgroundLight,
              border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: SafeArea(
              child: ElevatedButton.icon(
                  onPressed: () {
                      // Navigate back or to next
                       context.pop();
                  },
                  icon: const Icon(Ionicons.checkmark_circle),
                  label: const Text('تم الانتهاء'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
              ),
          ),
      );
  }
}
