import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, FlatList, Pressable, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getCourse, getLessons, getProgress, deleteLesson, getQuestions, getGames } from '@/lib/storage';
import type { Course, Lesson, Progress } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  progress?: Progress;
  hasQuiz: boolean;
  hasGame: boolean;
}

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const c = await getCourse(id);
    if (c) setCourse(c);
    const ls = await getLessons(id);
    const withProgress: LessonWithProgress[] = [];
    for (const l of ls) {
      const p = await getProgress(l.id);
      const q = await getQuestions(l.id);
      const g = await getGames(l.id);
      withProgress.push({ ...l, progress: p, hasQuiz: q.length > 0, hasGame: g.length > 0 });
    }
    setLessons(withProgress);
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDeleteLesson = (lesson: LessonWithProgress) => {
    Alert.alert('حذف الحصة', `هل تريد حذف "${lesson.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await deleteLesson(lesson.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          loadData();
        },
      },
    ]);
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const renderLesson = ({ item, index }: { item: LessonWithProgress; index: number }) => {
    const isCompleted = item.progress?.completed;
    return (
      <Pressable
        style={({ pressed }) => [styles.lessonCard, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: '/lesson/[id]', params: { id: item.id } });
        }}
        onLongPress={() => handleDeleteLesson(item)}
      >
        <View style={styles.lessonRow}>
          <View style={styles.lessonRight}>
            <View style={[styles.lessonNumber, isCompleted && { backgroundColor: Colors.success }]}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : (
                <Text style={styles.lessonNumText}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <View style={styles.lessonTags}>
                <View style={styles.tag}>
                  <Ionicons name={item.type === 'dialogue' ? 'chatbubbles-outline' : 'videocam-outline'} size={12} color={Colors.primary} />
                  <Text style={styles.tagText}>{item.type === 'dialogue' ? 'حوار' : 'فيديو'}</Text>
                </View>
                {item.hasQuiz && (
                  <View style={styles.tag}>
                    <Ionicons name="help-circle-outline" size={12} color={Colors.accent} />
                    <Text style={styles.tagText}>اختبار</Text>
                  </View>
                )}
                {item.hasGame && (
                  <View style={styles.tag}>
                    <Ionicons name="game-controller-outline" size={12} color={Colors.success} />
                    <Text style={styles.tagText}>لعبة</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <Ionicons name="chevron-back" size={20} color={Colors.textMuted} />
        </View>
      </Pressable>
    );
  };

  if (!course) return null;

  const completedCount = lessons.filter(l => l.progress?.completed).length;
  const progressPercent = lessons.length > 0 ? completedCount / lessons.length : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <LinearGradient
        colors={[course.color || Colors.primary, Colors.background]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({ pathname: '/add-lesson', params: { courseId: course.id } });
              }}
              style={styles.headerActionBtn}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDesc}>{course.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{lessons.length}</Text>
            <Text style={styles.statLabel}>حصة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Text style={styles.statLabel}>مكتملة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{Math.round(progressPercent * 100)}%</Text>
            <Text style={styles.statLabel}>التقدم</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>الحصص</Text>
      </View>

      {lessons.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>لا توجد حصص بعد</Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderLesson}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row-reverse', gap: 8 },
  headerActionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontFamily: 'Cairo_700Bold', fontSize: 28, color: '#fff', textAlign: 'right', marginBottom: 8 },
  courseDesc: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'right', marginBottom: 20, lineHeight: 22 },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: 16 },
  stat: { alignItems: 'center' },
  statNum: { fontFamily: 'Cairo_700Bold', fontSize: 22, color: '#fff' },
  statLabel: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: Colors.text, textAlign: 'right' },
  list: { paddingHorizontal: 20 },
  lessonCard: { backgroundColor: Colors.backgroundCard, borderRadius: 16, padding: 16, marginBottom: 12 },
  lessonRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  lessonRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, flex: 1 },
  lessonNumber: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  lessonNumText: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: Colors.text },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: Colors.text, textAlign: 'right', marginBottom: 6 },
  lessonTags: { flexDirection: 'row-reverse', gap: 8 },
  tag: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  tagText: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: Colors.textSecondary },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.textMuted },
});
