class Course {
  final String id;
  final String title;
  final String description;
  final String color;
  final String icon;
  final int lessonsCount;
  final int createdAt;

  Course({
    required this.id,
    required this.title,
    required this.description,
    required this.color,
    required this.icon,
    required this.lessonsCount,
    required this.createdAt,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      color: json['color'],
      icon: json['icon'],
      lessonsCount: json['lessonsCount'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'color': color,
      'icon': icon,
      'lessonsCount': lessonsCount,
      'createdAt': createdAt,
    };
  }
}

class Lesson {
  final String id;
  final String courseId;
  final String title;
  final String type; // 'dialogue' | 'video'
  final int order;
  final List<DialogueMessage>? content;
  final String? videoUrl;
  final int createdAt;

  Lesson({
    required this.id,
    required this.courseId,
    required this.title,
    required this.type,
    required this.order,
    this.content,
    this.videoUrl,
    required this.createdAt,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id'],
      courseId: json['courseId'],
      title: json['title'],
      type: json['type'],
      order: json['order'],
      content: json['content'] != null
          ? (json['content'] as List).map((i) => DialogueMessage.fromJson(i)).toList()
          : null,
      videoUrl: json['videoUrl'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseId': courseId,
      'title': title,
      'type': type,
      'order': order,
      'content': content?.map((e) => e.toJson()).toList(),
      'videoUrl': videoUrl,
      'createdAt': createdAt,
    };
  }
}

class DialogueMessage {
  final String id;
  final String sender; // 'robot' | 'user'
  final String text;

  DialogueMessage({
    required this.id,
    required this.sender,
    required this.text,
  });

  factory DialogueMessage.fromJson(Map<String, dynamic> json) {
    return DialogueMessage(
      id: json['id'],
      sender: json['sender'],
      text: json['text'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender': sender,
      'text': text,
    };
  }
}

class Question {
  final String id;
  final String lessonId;
  final String text;
  final List<String> options;
  final int correctIndex;
  final int order;

  Question({
    required this.id,
    required this.lessonId,
    required this.text,
    required this.options,
    required this.correctIndex,
    required this.order,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      lessonId: json['lessonId'],
      text: json['text'],
      options: List<String>.from(json['options']),
      correctIndex: json['correctIndex'],
      order: json['order'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lessonId': lessonId,
      'text': text,
      'options': options,
      'correctIndex': correctIndex,
      'order': order,
    };
  }
}

class Game {
  final String id;
  final String lessonId;
  final String type; // 'word-order' | 'memory'
  final String title;
  final dynamic data;

  Game({
    required this.id,
    required this.lessonId,
    required this.type,
    required this.title,
    required this.data,
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'],
      lessonId: json['lessonId'],
      type: json['type'],
      title: json['title'],
      data: json['data'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lessonId': lessonId,
      'type': type,
      'title': title,
      'data': data,
    };
  }
}

class Progress {
  final String lessonId;
  final bool completed;
  final int? quizScore;
  final int? completedAt;

  Progress({
    required this.lessonId,
    required this.completed,
    this.quizScore,
    this.completedAt,
  });

  factory Progress.fromJson(Map<String, dynamic> json) {
    return Progress(
      lessonId: json['lessonId'],
      completed: json['completed'],
      quizScore: json['quizScore'],
      completedAt: json['completedAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'lessonId': lessonId,
      'completed': completed,
      'quizScore': quizScore,
      'completedAt': completedAt,
    };
  }
}
