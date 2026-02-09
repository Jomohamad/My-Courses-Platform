import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { Course, Lesson, Question, Game, Progress } from './types';

const KEYS = {
  COURSES: 'courses',
  LESSONS: 'lessons',
  QUESTIONS: 'questions',
  GAMES: 'games',
  PROGRESS: 'progress',
};

async function getItem<T>(key: string): Promise<T[]> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

async function setItem<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Crypto.randomUUID();
}

export async function getCourses(): Promise<Course[]> {
  return getItem<Course>(KEYS.COURSES);
}

export async function getCourse(id: string): Promise<Course | undefined> {
  const courses = await getCourses();
  return courses.find(c => c.id === id);
}

export async function addCourse(course: Omit<Course, 'id' | 'createdAt' | 'lessonsCount'>): Promise<Course> {
  const courses = await getCourses();
  const newCourse: Course = {
    ...course,
    id: generateId(),
    lessonsCount: 0,
    createdAt: Date.now(),
  };
  courses.push(newCourse);
  await setItem(KEYS.COURSES, courses);
  return newCourse;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<void> {
  const courses = await getCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    await setItem(KEYS.COURSES, courses);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  let courses = await getCourses();
  courses = courses.filter(c => c.id !== id);
  await setItem(KEYS.COURSES, courses);

  let lessons = await getLessons(id);
  for (const lesson of lessons) {
    await deleteLesson(lesson.id);
  }
}

export async function getLessons(courseId: string): Promise<Lesson[]> {
  const lessons = await getItem<Lesson>(KEYS.LESSONS);
  return lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
}

export async function getLesson(id: string): Promise<Lesson | undefined> {
  const lessons = await getItem<Lesson>(KEYS.LESSONS);
  return lessons.find(l => l.id === id);
}

export async function addLesson(lesson: Omit<Lesson, 'id' | 'createdAt'>): Promise<Lesson> {
  const lessons = await getItem<Lesson>(KEYS.LESSONS);
  const newLesson: Lesson = {
    ...lesson,
    id: generateId(),
    createdAt: Date.now(),
  };
  lessons.push(newLesson);
  await setItem(KEYS.LESSONS, lessons);

  const courses = await getCourses();
  const courseIndex = courses.findIndex(c => c.id === lesson.courseId);
  if (courseIndex !== -1) {
    const courseLessons = lessons.filter(l => l.courseId === lesson.courseId);
    courses[courseIndex].lessonsCount = courseLessons.length;
    await setItem(KEYS.COURSES, courses);
  }

  return newLesson;
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<void> {
  const lessons = await getItem<Lesson>(KEYS.LESSONS);
  const index = lessons.findIndex(l => l.id === id);
  if (index !== -1) {
    lessons[index] = { ...lessons[index], ...updates };
    await setItem(KEYS.LESSONS, lessons);
  }
}

export async function deleteLesson(id: string): Promise<void> {
  let lessons = await getItem<Lesson>(KEYS.LESSONS);
  const lesson = lessons.find(l => l.id === id);
  lessons = lessons.filter(l => l.id !== id);
  await setItem(KEYS.LESSONS, lessons);

  if (lesson) {
    const courses = await getCourses();
    const courseIndex = courses.findIndex(c => c.id === lesson.courseId);
    if (courseIndex !== -1) {
      const courseLessons = lessons.filter(l => l.courseId === lesson.courseId);
      courses[courseIndex].lessonsCount = courseLessons.length;
      await setItem(KEYS.COURSES, courses);
    }
  }

  let questions = await getItem<Question>(KEYS.QUESTIONS);
  questions = questions.filter(q => q.lessonId !== id);
  await setItem(KEYS.QUESTIONS, questions);

  let games = await getItem<Game>(KEYS.GAMES);
  games = games.filter(g => g.lessonId !== id);
  await setItem(KEYS.GAMES, games);
}

export async function getQuestions(lessonId: string): Promise<Question[]> {
  const questions = await getItem<Question>(KEYS.QUESTIONS);
  return questions.filter(q => q.lessonId === lessonId).sort((a, b) => a.order - b.order);
}

export async function addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
  const questions = await getItem<Question>(KEYS.QUESTIONS);
  const newQuestion: Question = { ...question, id: generateId() };
  questions.push(newQuestion);
  await setItem(KEYS.QUESTIONS, questions);
  return newQuestion;
}

export async function updateQuestion(id: string, updates: Partial<Question>): Promise<void> {
  const questions = await getItem<Question>(KEYS.QUESTIONS);
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updates };
    await setItem(KEYS.QUESTIONS, questions);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  let questions = await getItem<Question>(KEYS.QUESTIONS);
  questions = questions.filter(q => q.id !== id);
  await setItem(KEYS.QUESTIONS, questions);
}

export async function getGames(lessonId: string): Promise<Game[]> {
  const games = await getItem<Game>(KEYS.GAMES);
  return games.filter(g => g.lessonId === lessonId);
}

export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  const games = await getItem<Game>(KEYS.GAMES);
  const newGame: Game = { ...game, id: generateId() };
  games.push(newGame);
  await setItem(KEYS.GAMES, games);
  return newGame;
}

export async function deleteGame(id: string): Promise<void> {
  let games = await getItem<Game>(KEYS.GAMES);
  games = games.filter(g => g.id !== id);
  await setItem(KEYS.GAMES, games);
}

export async function getProgress(lessonId: string): Promise<Progress | undefined> {
  const progress = await getItem<Progress>(KEYS.PROGRESS);
  return progress.find(p => p.lessonId === lessonId);
}

export async function getCourseProgress(courseId: string): Promise<Progress[]> {
  const lessons = await getLessons(courseId);
  const progress = await getItem<Progress>(KEYS.PROGRESS);
  return progress.filter(p => lessons.some(l => l.id === p.lessonId));
}

export async function setProgress(prog: Progress): Promise<void> {
  const progress = await getItem<Progress>(KEYS.PROGRESS);
  const index = progress.findIndex(p => p.lessonId === prog.lessonId);
  if (index !== -1) {
    progress[index] = prog;
  } else {
    progress.push(prog);
  }
  await setItem(KEYS.PROGRESS, progress);
}

export async function seedSampleData(): Promise<void> {
  const courses = await getCourses();
  if (courses.length > 0) return;

  const course1 = await addCourse({
    title: 'أساسيات البرمجة',
    description: 'تعلم أساسيات البرمجة من الصفر بطريقة تفاعلية وممتعة',
    color: '#0A8F8F',
    icon: 'code-slash',
  });

  const lesson1 = await addLesson({
    courseId: course1.id,
    title: 'ما هي البرمجة؟',
    type: 'dialogue',
    order: 1,
    content: [
      { id: '1', sender: 'robot', text: 'أهلاً بيك! النهارده هنتكلم عن البرمجة. عارف يعني ايه برمجة؟' },
      { id: '2', sender: 'user', text: 'مش متأكد.. ممكن توضحلي؟' },
      { id: '3', sender: 'robot', text: 'البرمجة ببساطة هي إنك تكتب تعليمات للكمبيوتر عشان ينفذها. زي ما بتديّ واحد وصفة أكل، بتقوله الخطوات واحدة واحدة.' },
      { id: '4', sender: 'user', text: 'يعني أنا بقول للكمبيوتر يعمل ايه؟' },
      { id: '5', sender: 'robot', text: 'بالظبط! بس لازم تقوله بلغة يفهمها. اللغات دي زي Python و JavaScript و غيرهم كتير.' },
      { id: '6', sender: 'user', text: 'طيب أبدأ بأنهي لغة؟' },
      { id: '7', sender: 'robot', text: 'Python أحسن لغة للمبتدئين لأنها سهلة وبسيطة. هنبدأ بيها في الدروس الجاية!' },
    ],
  });

  await addQuestion({
    lessonId: lesson1.id,
    text: 'ما هي البرمجة؟',
    options: ['رسم على الكمبيوتر', 'كتابة تعليمات للكمبيوتر', 'لعب ألعاب', 'تصميم مواقع فقط'],
    correctIndex: 1,
    order: 1,
  });

  await addQuestion({
    lessonId: lesson1.id,
    text: 'أي لغة برمجة مناسبة للمبتدئين؟',
    options: ['Assembly', 'C++', 'Python', 'Rust'],
    correctIndex: 2,
    order: 2,
  });

  await addGame({
    lessonId: lesson1.id,
    type: 'word-order',
    title: 'رتب الجملة',
    data: {
      sentence: 'البرمجة هي كتابة تعليمات للكمبيوتر',
      words: ['للكمبيوتر', 'تعليمات', 'كتابة', 'هي', 'البرمجة'],
    } as any,
  });

  await addGame({
    lessonId: lesson1.id,
    type: 'memory',
    title: 'لعبة الذاكرة',
    data: {
      pairs: [
        { term: 'Python', definition: 'لغة سهلة للمبتدئين' },
        { term: 'البرمجة', definition: 'كتابة تعليمات للكمبيوتر' },
        { term: 'JavaScript', definition: 'لغة تطوير المواقع' },
        { term: 'الكود', definition: 'التعليمات المكتوبة' },
      ],
    } as any,
  });

  const lesson2 = await addLesson({
    courseId: course1.id,
    title: 'المتغيرات في Python',
    type: 'dialogue',
    order: 2,
    content: [
      { id: '1', sender: 'robot', text: 'النهارده هنتعلم حاجة مهمة جداً: المتغيرات!' },
      { id: '2', sender: 'user', text: 'ايه هي المتغيرات دي؟' },
      { id: '3', sender: 'robot', text: 'المتغير زي الصندوق اللي بتحط فيه حاجة. مثلاً: name = "أحمد" - هنا عملنا صندوق اسمه name وحطينا فيه كلمة أحمد.' },
      { id: '4', sender: 'user', text: 'أقدر أحط أرقام كمان؟' },
      { id: '5', sender: 'robot', text: 'طبعاً! age = 25 - هنا حطينا رقم 25 في صندوق اسمه age. تقدر تحط نصوص وأرقام وحاجات تانية كتير.' },
    ],
  });

  await addQuestion({
    lessonId: lesson2.id,
    text: 'المتغير في البرمجة يشبه:',
    options: ['شاشة الكمبيوتر', 'صندوق لتخزين البيانات', 'لوحة المفاتيح', 'الماوس'],
    correctIndex: 1,
    order: 1,
  });

  const course2 = await addCourse({
    title: 'تصميم المواقع',
    description: 'اتعلم HTML و CSS وابدأ تصمم مواقعك الخاصة',
    color: '#F5A623',
    icon: 'globe-outline',
  });

  await addLesson({
    courseId: course2.id,
    title: 'مقدمة في HTML',
    type: 'dialogue',
    order: 1,
    content: [
      { id: '1', sender: 'robot', text: 'مرحباً! جاهز تتعلم تصميم المواقع؟' },
      { id: '2', sender: 'user', text: 'أيوا! بس ايه هي HTML؟' },
      { id: '3', sender: 'robot', text: 'HTML هي لغة بنبني بيها هيكل صفحة الويب. زي ما البيت محتاج أساس وحيطان، الموقع محتاج HTML.' },
      { id: '4', sender: 'user', text: 'يعني HTML هي أساس أي موقع؟' },
      { id: '5', sender: 'robot', text: 'بالظبط! وبعد كده بنستخدم CSS عشان نزيّن الموقع ونخليه جميل.' },
    ],
  });
}
