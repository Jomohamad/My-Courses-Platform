import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, FlatList, Pressable, RefreshControl, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getCourses, getCourseProgress, deleteCourse } from '@/lib/storage';
import type { Course } from '@/lib/types';

const COURSE_COLORS = ['#0A8F8F', '#F5A623', '#E85D75', '#6C5CE7', '#00B894', '#FD79A8'];
const COURSE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'code-slash': 'code-slash',
  'globe-outline': 'globe-outline',
  'calculator-outline': 'calculator-outline',
  'book-outline': 'book-outline',
  'flask-outline': 'flask-outline',
  'musical-notes-outline': 'musical-notes-outline',
};

interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = useCallback(async () => {
    const allCourses = await getCourses();
    const coursesWithProgress: CourseWithProgress[] = [];
    for (const course of allCourses) {
      const progress = await getCourseProgress(course.id);
      const completed = progress.filter(p => p.completed).length;
      const total = course.lessonsCount || 1;
      coursesWithProgress.push({
        ...course,
        progress: total > 0 ? completed / total : 0,
        completedLessons: completed,
      });
    }
    setCourses(coursesWithProgress);
  }, []);

  useFocusEffect(useCallback(() => { loadCourses(); }, [loadCourses]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleDeleteCourse = (course: CourseWithProgress) => {
    Alert.alert('حذف الكورس', `هل تريد حذف "${course.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          await deleteCourse(course.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          loadCourses();
        },
      },
    ]);
  };

  const renderCourse = ({ item, index }: { item: CourseWithProgress; index: number }) => {
    const iconName = COURSE_ICONS[item.icon] || 'book-outline';
    return (
      <Pressable
        style={({ pressed }) => [styles.courseCard, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: '/course/[id]', params: { id: item.id } });
        }}
        onLongPress={() => handleDeleteCourse(item)}
      >
        <LinearGradient
          colors={[item.color || COURSE_COLORS[index % COURSE_COLORS.length], Colors.backgroundCard]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.courseGradient}
        >
          <View style={styles.courseHeader}>
            <View style={[styles.courseIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name={iconName} size={28} color="#fff" />
            </View>
            <View style={styles.courseMeta}>
              <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.courseMetaText}>{item.lessonsCount} حصة</Text>
            </View>
          </View>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: item.color || Colors.primary }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً بك</Text>
          <Text style={styles.headerTitle}>منصتي التعليمية</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/add-course');
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      {courses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد كورسات بعد</Text>
          <Text style={styles.emptyDesc}>اضغط + لإضافة أول كورس</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'right' },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: 26, color: Colors.text, textAlign: 'right' },
  addBtn: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  courseCard: { marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  courseGradient: { padding: 20 },
  courseHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  courseIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  courseMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  courseMetaText: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: Colors.textSecondary },
  courseTitle: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: Colors.text, textAlign: 'right', marginBottom: 6 },
  courseDesc: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 16, lineHeight: 22 },
  progressWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: 18, color: Colors.textSecondary },
  emptyDesc: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted },
});
