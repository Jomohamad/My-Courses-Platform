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

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.COURSES, KEYS.LESSONS, KEYS.QUESTIONS, KEYS.GAMES, KEYS.PROGRESS]);
}

export async function seedSampleData(): Promise<void> {
  const courses = await getCourses();
  if (courses.length > 0) return;

  // ===== كورس 1: أساسيات البرمجة =====
  const course1 = await addCourse({
    title: 'أساسيات البرمجة',
    description: 'تعلم أساسيات البرمجة من الصفر بطريقة تفاعلية وممتعة مع أمثلة عملية',
    color: '#0A8F8F',
    icon: 'code-slash',
  });

  // حصة 1: ما هي البرمجة؟
  const lesson1_1 = await addLesson({
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
      { id: '8', sender: 'user', text: 'تمام! أنا متحمس أبدأ.' },
      { id: '9', sender: 'robot', text: 'جميل! المبرمج الشاطر بيبدأ بالأساسيات وبعدين يبني عليها. يلا نكمل!' },
    ],
  });

  await addQuestion({ lessonId: lesson1_1.id, text: 'ما هي البرمجة؟', options: ['رسم على الكمبيوتر', 'كتابة تعليمات للكمبيوتر', 'لعب ألعاب', 'تصميم مواقع فقط'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson1_1.id, text: 'أي لغة برمجة مناسبة للمبتدئين؟', options: ['Assembly', 'C++', 'Python', 'Rust'], correctIndex: 2, order: 2 });
  await addQuestion({ lessonId: lesson1_1.id, text: 'البرمجة تشبه:', options: ['كتابة وصفة أكل بالخطوات', 'الرسم العشوائي', 'حفظ الأغاني', 'لعب الكرة'], correctIndex: 0, order: 3 });

  await addGame({ lessonId: lesson1_1.id, type: 'word-order', title: 'رتب الجملة', data: { sentence: 'البرمجة هي كتابة تعليمات للكمبيوتر', words: ['للكمبيوتر', 'تعليمات', 'كتابة', 'هي', 'البرمجة'] } as any });
  await addGame({ lessonId: lesson1_1.id, type: 'memory', title: 'لعبة الذاكرة', data: { pairs: [{ term: 'Python', definition: 'لغة سهلة للمبتدئين' }, { term: 'البرمجة', definition: 'كتابة تعليمات للكمبيوتر' }, { term: 'JavaScript', definition: 'لغة تطوير المواقع' }, { term: 'الكود', definition: 'التعليمات المكتوبة' }] } as any });

  // حصة 2: المتغيرات
  const lesson1_2 = await addLesson({
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
      { id: '6', sender: 'user', text: 'وأقدر أغير القيمة بتاعة المتغير؟' },
      { id: '7', sender: 'robot', text: 'أيوا! ده اسمه "متغير" عشان قيمته ممكن تتغير. لو كتبت age = 30 بعد كده، قيمة age هتبقى 30 بدل 25.' },
      { id: '8', sender: 'user', text: 'فهمت! المتغير صندوق أقدر أغير محتواه.' },
      { id: '9', sender: 'robot', text: 'بالظبط! وفيه أنواع للبيانات: نصوص (String)، أرقام صحيحة (Integer)، وأرقام عشرية (Float). هنتعلمهم بالتفصيل!' },
    ],
  });

  await addQuestion({ lessonId: lesson1_2.id, text: 'المتغير في البرمجة يشبه:', options: ['شاشة الكمبيوتر', 'صندوق لتخزين البيانات', 'لوحة المفاتيح', 'الماوس'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson1_2.id, text: 'ما نتيجة: name = "سارة"؟', options: ['خطأ في البرنامج', 'تخزين كلمة سارة في متغير name', 'حذف متغير name', 'طباعة سارة'], correctIndex: 1, order: 2 });
  await addQuestion({ lessonId: lesson1_2.id, text: 'أي نوع بيانات للرقم 3.14؟', options: ['String', 'Integer', 'Float', 'Boolean'], correctIndex: 2, order: 3 });

  await addGame({ lessonId: lesson1_2.id, type: 'memory', title: 'أنواع البيانات', data: { pairs: [{ term: 'String', definition: 'نص مثل "أحمد"' }, { term: 'Integer', definition: 'رقم صحيح مثل 25' }, { term: 'Float', definition: 'رقم عشري مثل 3.14' }, { term: 'Boolean', definition: 'صح أو خطأ' }] } as any });
  await addGame({ lessonId: lesson1_2.id, type: 'word-order', title: 'رتب التعريف', data: { sentence: 'المتغير هو صندوق لتخزين البيانات', words: ['البيانات', 'لتخزين', 'صندوق', 'هو', 'المتغير'] } as any });

  // حصة 3: الشروط
  const lesson1_3 = await addLesson({
    courseId: course1.id,
    title: 'الجمل الشرطية',
    type: 'dialogue',
    order: 3,
    content: [
      { id: '1', sender: 'robot', text: 'النهارده هنتكلم عن الجمل الشرطية! يعني الكمبيوتر يقدر ياخد قرارات.' },
      { id: '2', sender: 'user', text: 'الكمبيوتر بياخد قرارات ازاي؟' },
      { id: '3', sender: 'robot', text: 'بنستخدم كلمة if يعني "لو". مثلاً: لو عمرك أكبر من 18 يبقى تقدر تسوق، غير كده لأ.' },
      { id: '4', sender: 'user', text: 'يعني بقوله لو حصل كذا اعمل كذا؟' },
      { id: '5', sender: 'robot', text: 'بالظبط! وبنستخدم else يعني "غير كده" لو الشرط مش متحقق. وفيه elif يعني "أو لو" لشروط تانية.' },
      { id: '6', sender: 'user', text: 'ممكن مثال عملي؟' },
      { id: '7', sender: 'robot', text: 'أكيد! لو الدرجة >= 50: ناجح، غير كده: راسب. كده الكمبيوتر بيقرر بناءً على الشرط اللي حطيتهوله.' },
      { id: '8', sender: 'user', text: 'حلو! يعني if و else هما أساس القرارات.' },
      { id: '9', sender: 'robot', text: 'تمام! ومن غير الشروط دي البرنامج هيفضل يعمل نفس الحاجة كل مرة. الشروط هي اللي بتخلي البرنامج ذكي!' },
    ],
  });

  await addQuestion({ lessonId: lesson1_3.id, text: 'كلمة if في البرمجة معناها:', options: ['كرر', 'لو (شرط)', 'اطبع', 'احذف'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson1_3.id, text: 'else تستخدم عندما:', options: ['الشرط متحقق', 'الشرط غير متحقق', 'في كل الحالات', 'مع الأرقام فقط'], correctIndex: 1, order: 2 });

  await addGame({ lessonId: lesson1_3.id, type: 'word-order', title: 'رتب الشرط', data: { sentence: 'لو الدرجة أكبر من خمسين يبقى ناجح', words: ['ناجح', 'يبقى', 'خمسين', 'من', 'أكبر', 'الدرجة', 'لو'] } as any });

  // حصة 4: الحلقات
  const lesson1_4 = await addLesson({
    courseId: course1.id,
    title: 'الحلقات التكرارية',
    type: 'dialogue',
    order: 4,
    content: [
      { id: '1', sender: 'robot', text: 'تخيل إنك عايز تطبع الأرقام من 1 لحد 100. هتكتب 100 سطر؟' },
      { id: '2', sender: 'user', text: 'طبعاً لأ! لازم فيه طريقة أسهل.' },
      { id: '3', sender: 'robot', text: 'بالظبط! الحل هو الحلقات أو Loops. بتخلي الكمبيوتر يكرر حاجة معينة عدد معين من المرات.' },
      { id: '4', sender: 'user', text: 'ازاي بنكتبها؟' },
      { id: '5', sender: 'robot', text: 'فيه نوعين: for loop بتكرر عدد محدد، و while loop بتكرر طول ما الشرط صحيح.' },
      { id: '6', sender: 'user', text: 'يعني for لما أعرف عدد المرات، و while لما مش عارف؟' },
      { id: '7', sender: 'robot', text: 'بالظبط كده! مثلاً: for i in range(10) - هتكرر 10 مرات. أما while x > 0 - هتفضل تكرر طول ما x أكبر من صفر.' },
    ],
  });

  await addQuestion({ lessonId: lesson1_4.id, text: 'الحلقات (Loops) تستخدم لـ:', options: ['حذف البيانات', 'تكرار تعليمات معينة', 'تعريف متغيرات', 'طباعة نصوص فقط'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson1_4.id, text: 'for loop تكرر:', options: ['مرة واحدة فقط', 'عدد محدد من المرات', 'بلا نهاية', 'مرتين فقط'], correctIndex: 1, order: 2 });

  await addGame({ lessonId: lesson1_4.id, type: 'memory', title: 'أنواع الحلقات', data: { pairs: [{ term: 'for loop', definition: 'تكرار عدد محدد' }, { term: 'while loop', definition: 'تكرار بشرط' }, { term: 'range(10)', definition: 'الأرقام من 0 لـ 9' }, { term: 'break', definition: 'إيقاف الحلقة' }] } as any });

  // حصة 5: فيديو شرح
  await addLesson({
    courseId: course1.id,
    title: 'فيديو: مقدمة عن Python',
    type: 'video',
    order: 5,
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  });

  // ===== كورس 2: تصميم المواقع =====
  const course2 = await addCourse({
    title: 'تصميم المواقع',
    description: 'اتعلم HTML و CSS وابدأ تصمم مواقعك الخاصة من الصفر',
    color: '#F5A623',
    icon: 'globe-outline',
  });

  const lesson2_1 = await addLesson({
    courseId: course2.id,
    title: 'مقدمة في HTML',
    type: 'dialogue',
    order: 1,
    content: [
      { id: '1', sender: 'robot', text: 'مرحباً! جاهز تتعلم تصميم المواقع؟' },
      { id: '2', sender: 'user', text: 'أيوا! بس ايه هي HTML؟' },
      { id: '3', sender: 'robot', text: 'HTML هي لغة بنبني بيها هيكل صفحة الويب. زي ما البيت محتاج أساس وحيطان، الموقع محتاج HTML.' },
      { id: '4', sender: 'user', text: 'يعني HTML هي أساس أي موقع؟' },
      { id: '5', sender: 'robot', text: 'بالظبط! كل حاجة بتشوفها على النت مبنية بـ HTML. العناوين، الفقرات، الصور، الروابط... كلها عناصر HTML.' },
      { id: '6', sender: 'user', text: 'طيب ازاي بكتب HTML؟' },
      { id: '7', sender: 'robot', text: 'بنستخدم حاجة اسمها Tags أو وسوم. كل عنصر ليه وسم فتح وقفل. مثلاً <p> لبداية فقرة و </p> لنهايتها.' },
      { id: '8', sender: 'user', text: 'فهمت! كأني بحوط النص بين علامتين.' },
      { id: '9', sender: 'robot', text: 'بالظبط! وبعد كده بنستخدم CSS عشان نزيّن الموقع ونخليه جميل. HTML للهيكل و CSS للشكل!' },
    ],
  });

  await addQuestion({ lessonId: lesson2_1.id, text: 'HTML تستخدم لـ:', options: ['تزيين الموقع', 'بناء هيكل صفحة الويب', 'برمجة الألعاب', 'إدارة قواعد البيانات'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson2_1.id, text: 'وسم الفقرة في HTML هو:', options: ['<h1>', '<p>', '<div>', '<img>'], correctIndex: 1, order: 2 });
  await addQuestion({ lessonId: lesson2_1.id, text: 'CSS تستخدم لـ:', options: ['بناء هيكل الصفحة', 'تزيين وتنسيق الموقع', 'تشغيل الفيديو', 'إرسال البريد'], correctIndex: 1, order: 3 });

  await addGame({ lessonId: lesson2_1.id, type: 'memory', title: 'وسوم HTML', data: { pairs: [{ term: '<p>', definition: 'فقرة نصية' }, { term: '<h1>', definition: 'عنوان رئيسي' }, { term: '<img>', definition: 'صورة' }, { term: '<a>', definition: 'رابط' }] } as any });
  await addGame({ lessonId: lesson2_1.id, type: 'word-order', title: 'رتب المفهوم', data: { sentence: 'HTML تبني هيكل صفحة الويب', words: ['الويب', 'صفحة', 'هيكل', 'تبني', 'HTML'] } as any });

  // حصة 2: CSS
  const lesson2_2 = await addLesson({
    courseId: course2.id,
    title: 'تنسيق بـ CSS',
    type: 'dialogue',
    order: 2,
    content: [
      { id: '1', sender: 'robot', text: 'دلوقتي هنتعلم CSS عشان نخلي المواقع جميلة!' },
      { id: '2', sender: 'user', text: 'CSS بتعمل ايه بالظبط؟' },
      { id: '3', sender: 'robot', text: 'CSS بتتحكم في شكل العناصر: الألوان، الخطوط، الأحجام، المسافات، وحتى الحركات.' },
      { id: '4', sender: 'user', text: 'يعني لو عايز أغير لون النص؟' },
      { id: '5', sender: 'robot', text: 'بتكتب color: red; وده هيخلي لون النص أحمر. أو background-color: blue; للخلفية الزرقاء.' },
      { id: '6', sender: 'user', text: 'سهلة! وازاي بربط CSS بـ HTML؟' },
      { id: '7', sender: 'robot', text: 'فيه 3 طرق: داخل العنصر، في وسم <style> في الصفحة، أو في ملف منفصل وده الأحسن لأنه بينظم الكود.' },
    ],
  });

  await addQuestion({ lessonId: lesson2_2.id, text: 'CSS تتحكم في:', options: ['محتوى الصفحة', 'شكل ومظهر العناصر', 'قاعدة البيانات', 'سرعة الإنترنت'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson2_2.id, text: 'لتغيير لون النص نستخدم:', options: ['font-size', 'color', 'margin', 'display'], correctIndex: 1, order: 2 });

  await addGame({ lessonId: lesson2_2.id, type: 'memory', title: 'خصائص CSS', data: { pairs: [{ term: 'color', definition: 'لون النص' }, { term: 'font-size', definition: 'حجم الخط' }, { term: 'margin', definition: 'المسافة الخارجية' }, { term: 'padding', definition: 'المسافة الداخلية' }] } as any });

  // ===== كورس 3: الرياضيات =====
  const course3 = await addCourse({
    title: 'الرياضيات الممتعة',
    description: 'اكتشف جمال الرياضيات بطريقة تفاعلية وبسيطة مع ألعاب وأمثلة',
    color: '#6C5CE7',
    icon: 'calculator-outline',
  });

  const lesson3_1 = await addLesson({
    courseId: course3.id,
    title: 'الكسور والنسب',
    type: 'dialogue',
    order: 1,
    content: [
      { id: '1', sender: 'robot', text: 'النهارده هنتكلم عن الكسور! تخيل إن عندك بيتزا وعايز تقسمها.' },
      { id: '2', sender: 'user', text: 'أيوا، لو قسمتها نصين يبقى كل واحد نص.' },
      { id: '3', sender: 'robot', text: 'بالظبط! النص ده بنكتبه ½ - يعني 1 من 2. الرقم اللي فوق اسمه بسط واللي تحت اسمه مقام.' },
      { id: '4', sender: 'user', text: 'طيب لو قسمتها 4 حتت؟' },
      { id: '5', sender: 'robot', text: 'كل حتة هتبقى ¼ يعني ربع. ولو أخدت 3 حتت من 4 يبقى عندك ¾ يعني تلات أرباع.' },
      { id: '6', sender: 'user', text: 'فهمت! والنسب المئوية؟' },
      { id: '7', sender: 'robot', text: 'النسبة المئوية هي كسر مقامه 100. يعني 50% = 50/100 = ½. سهلة مش كده؟' },
      { id: '8', sender: 'user', text: 'أيوا سهلة جداً!' },
    ],
  });

  await addQuestion({ lessonId: lesson3_1.id, text: 'الرقم اللي فوق في الكسر اسمه:', options: ['مقام', 'بسط', 'ناتج', 'أس'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson3_1.id, text: '50% تساوي:', options: ['¼', '½', '¾', '⅓'], correctIndex: 1, order: 2 });
  await addQuestion({ lessonId: lesson3_1.id, text: 'لو قسمنا كيكة 8 قطع وأخدنا 2:', options: ['¼', '½', '⅛', '²⁄₈'], correctIndex: 0, order: 3 });

  await addGame({ lessonId: lesson3_1.id, type: 'memory', title: 'الكسور والنسب', data: { pairs: [{ term: '½', definition: '50%' }, { term: '¼', definition: '25%' }, { term: '¾', definition: '75%' }, { term: '⅓', definition: '33%' }] } as any });
  await addGame({ lessonId: lesson3_1.id, type: 'word-order', title: 'رتب التعريف', data: { sentence: 'البسط هو الرقم فوق خط الكسر', words: ['الكسر', 'خط', 'فوق', 'الرقم', 'هو', 'البسط'] } as any });

  const lesson3_2 = await addLesson({
    courseId: course3.id,
    title: 'المعادلات البسيطة',
    type: 'dialogue',
    order: 2,
    content: [
      { id: '1', sender: 'robot', text: 'النهارده هنحل معادلات! المعادلة زي اللغز الرياضي.' },
      { id: '2', sender: 'user', text: 'لغز ازاي؟' },
      { id: '3', sender: 'robot', text: 'مثلاً: x + 5 = 12. محتاج تعرف قيمة x. يعني ايه رقم لو زودت عليه 5 يطلع 12؟' },
      { id: '4', sender: 'user', text: '7! لأن 7 + 5 = 12' },
      { id: '5', sender: 'robot', text: 'برافو! الطريقة الرسمية: x = 12 - 5 = 7. بننقل الرقم للناحية التانية ونغير إشارته.' },
      { id: '6', sender: 'user', text: 'يعني اللي مع + بيبقى - لما أنقله؟' },
      { id: '7', sender: 'robot', text: 'بالظبط! والضرب بيبقى قسمة والعكس. مثلاً: 3x = 15 يبقى x = 15 ÷ 3 = 5.' },
    ],
  });

  await addQuestion({ lessonId: lesson3_2.id, text: 'لو x + 3 = 10، قيمة x:', options: ['3', '10', '7', '13'], correctIndex: 2, order: 1 });
  await addQuestion({ lessonId: lesson3_2.id, text: 'لو 2x = 8، قيمة x:', options: ['2', '4', '6', '8'], correctIndex: 1, order: 2 });

  await addGame({ lessonId: lesson3_2.id, type: 'memory', title: 'حل المعادلات', data: { pairs: [{ term: 'x + 5 = 12', definition: 'x = 7' }, { term: '3x = 15', definition: 'x = 5' }, { term: 'x - 4 = 6', definition: 'x = 10' }, { term: 'x ÷ 2 = 8', definition: 'x = 16' }] } as any });

  // ===== كورس 4: العلوم =====
  const course4 = await addCourse({
    title: 'عالم العلوم',
    description: 'اكتشف أسرار الكون والطبيعة من خلال دروس تفاعلية شيقة',
    color: '#E85D75',
    icon: 'flask-outline',
  });

  const lesson4_1 = await addLesson({
    courseId: course4.id,
    title: 'النظام الشمسي',
    type: 'dialogue',
    order: 1,
    content: [
      { id: '1', sender: 'robot', text: 'النهارده هنطلع رحلة في الفضاء! جاهز تتعرف على النظام الشمسي؟' },
      { id: '2', sender: 'user', text: 'أكيد! كام كوكب فيه؟' },
      { id: '3', sender: 'robot', text: 'فيه 8 كواكب بتدور حوالين الشمس. أقربهم عطارد وأبعدهم نبتون.' },
      { id: '4', sender: 'user', text: 'والأرض ترتيبها كام؟' },
      { id: '5', sender: 'robot', text: 'الأرض الكوكب التالت. الترتيب: عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، نبتون.' },
      { id: '6', sender: 'user', text: 'والمشتري هو أكبر كوكب صح؟' },
      { id: '7', sender: 'robot', text: 'صح! المشتري أكبر من الأرض بـ 1300 مرة تقريباً! وزحل مشهور بحلقاته الجميلة.' },
      { id: '8', sender: 'user', text: 'الفضاء مذهل فعلاً!' },
      { id: '9', sender: 'robot', text: 'جداً! وده بس جزء صغير من الكون. المجرة بتاعتنا (درب التبانة) فيها مليارات النجوم!' },
    ],
  });

  await addQuestion({ lessonId: lesson4_1.id, text: 'كم عدد كواكب النظام الشمسي؟', options: ['7', '8', '9', '10'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson4_1.id, text: 'ترتيب الأرض من الشمس:', options: ['الأول', 'الثاني', 'الثالث', 'الرابع'], correctIndex: 2, order: 2 });
  await addQuestion({ lessonId: lesson4_1.id, text: 'أكبر كوكب في النظام الشمسي:', options: ['زحل', 'المشتري', 'الأرض', 'نبتون'], correctIndex: 1, order: 3 });

  await addGame({ lessonId: lesson4_1.id, type: 'memory', title: 'الكواكب', data: { pairs: [{ term: 'عطارد', definition: 'أقرب كوكب للشمس' }, { term: 'المشتري', definition: 'أكبر كوكب' }, { term: 'زحل', definition: 'الكوكب ذو الحلقات' }, { term: 'المريخ', definition: 'الكوكب الأحمر' }] } as any });
  await addGame({ lessonId: lesson4_1.id, type: 'word-order', title: 'رتب الكواكب', data: { sentence: 'عطارد الزهرة الأرض المريخ', words: ['المريخ', 'الأرض', 'الزهرة', 'عطارد'] } as any });

  const lesson4_2 = await addLesson({
    courseId: course4.id,
    title: 'حالات المادة',
    type: 'dialogue',
    order: 2,
    content: [
      { id: '1', sender: 'robot', text: 'كل حاجة حواليك مادة. والمادة ليها 3 حالات رئيسية.' },
      { id: '2', sender: 'user', text: 'ايه هم التلاتة؟' },
      { id: '3', sender: 'robot', text: 'صلبة، سائلة، وغازية. المكعب ثلج صلب، لما يسيح يبقى ماء سائل، ولما يغلي يبقى بخار غاز.' },
      { id: '4', sender: 'user', text: 'يعني نفس المادة ممكن تتحول؟' },
      { id: '5', sender: 'robot', text: 'أيوا! بالحرارة. لما تسخن المادة الصلبة بتسيح وتبقى سائلة. ولما تسخنها أكتر بتتبخر وتبقى غاز.' },
      { id: '6', sender: 'user', text: 'والعكس لما نبردها؟' },
      { id: '7', sender: 'robot', text: 'بالظبط! التبريد بيحولها من غاز لسائل (تكثف) ومن سائل لصلب (تجمد). الطبيعة رائعة!' },
    ],
  });

  await addQuestion({ lessonId: lesson4_2.id, text: 'حالات المادة الرئيسية:', options: ['2', '3', '4', '5'], correctIndex: 1, order: 1 });
  await addQuestion({ lessonId: lesson4_2.id, text: 'تحول الماء إلى بخار يسمى:', options: ['تجمد', 'انصهار', 'تبخر', 'تكثف'], correctIndex: 2, order: 2 });

  await addGame({ lessonId: lesson4_2.id, type: 'memory', title: 'تحولات المادة', data: { pairs: [{ term: 'انصهار', definition: 'صلب إلى سائل' }, { term: 'تبخر', definition: 'سائل إلى غاز' }, { term: 'تكثف', definition: 'غاز إلى سائل' }, { term: 'تجمد', definition: 'سائل إلى صلب' }] } as any });
}
