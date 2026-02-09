export interface Course {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  lessonsCount: number;
  createdAt: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'dialogue' | 'video';
  order: number;
  content?: DialogueMessage[];
  videoUrl?: string;
  createdAt: number;
}

export interface DialogueMessage {
  id: string;
  sender: 'robot' | 'user';
  text: string;
}

export interface Question {
  id: string;
  lessonId: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface Game {
  id: string;
  lessonId: string;
  type: 'word-order' | 'memory';
  title: string;
  data: WordOrderData | MemoryData;
}

export interface WordOrderData {
  sentence: string;
  words: string[];
}

export interface MemoryData {
  pairs: { term: string; definition: string }[];
}

export interface Progress {
  lessonId: string;
  completed: boolean;
  quizScore?: number;
  completedAt?: number;
}
