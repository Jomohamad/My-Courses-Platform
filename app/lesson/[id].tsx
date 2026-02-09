import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, FlatList, Pressable, Platform, Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getLesson, getQuestions, getGames, setProgress } from '@/lib/storage';
import type { Lesson, DialogueMessage } from '@/lib/types';

function DialogueBubble({ message, index }: { message: DialogueMessage; index: number }) {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(20)).current;

  useEffect(() => {
    const delay = index * 400;
    const timer = setTimeout(() => {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        RNAnimated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [index]);

  const isRobot = message.sender === 'robot';

  return (
    <RNAnimated.View style={[
      styles.bubbleWrap,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      isRobot ? styles.bubbleLeft : styles.bubbleRight,
    ]}>
      {isRobot && (
        <View style={styles.avatarWrap}>
          <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isRobot ? styles.robotBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isRobot ? styles.robotText : styles.userText]}>
          {message.text}
        </Text>
      </View>
      {!isRobot && (
        <View style={[styles.avatarWrap, { backgroundColor: Colors.accent }]}>
          <Ionicons name="person" size={18} color="#fff" />
        </View>
      )}
    </RNAnimated.View>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasGame, setHasGame] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const l = await getLesson(id);
    if (l) setLesson(l);
    const q = await getQuestions(id);
    setHasQuiz(q.length > 0);
    const g = await getGames(id);
    setHasGame(g.length > 0);
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const markComplete = async () => {
    if (!id) return;
    await setProgress({ lessonId: id, completed: true, completedAt: Date.now() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!lesson) return null;

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              router.push({ pathname: '/add-question', params: { lessonId: lesson.id } });
            }}
            style={styles.headerActionBtn}
          >
            <Ionicons name="help-circle-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              router.push({ pathname: '/add-game', params: { lessonId: lesson.id } });
            }}
            style={styles.headerActionBtn}
          >
            <Ionicons name="game-controller-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {lesson.type === 'dialogue' && lesson.content ? (
        <FlatList
          data={lesson.content}
          renderItem={({ item, index }) => <DialogueBubble message={item} index={index} />}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.dialogueList, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 120 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : lesson.type === 'video' ? (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.videoText}>فيديو الحصة</Text>
          {lesson.videoUrl && <Text style={styles.videoUrl}>{lesson.videoUrl}</Text>}
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.completeBtn, { opacity: pressed ? 0.9 : 1 }]}
          onPress={() => { markComplete(); router.back(); }}
        >
          <Text style={styles.completeBtnText}>تم الانتهاء</Text>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </Pressable>

        {hasQuiz && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.quizBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: '/quiz/[lessonId]', params: { lessonId: lesson.id } });
            }}
          >
            <Ionicons name="help-circle" size={20} color={Colors.accent} />
          </Pressable>
        )}

        {hasGame && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.gameBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: '/game/[lessonId]', params: { lessonId: lesson.id } });
            }}
          >
            <Ionicons name="game-controller" size={20} color={Colors.success} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, gap: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: 18, color: Colors.text, flex: 1, textAlign: 'right' },
  headerActions: { flexDirection: 'row-reverse', gap: 6 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  dialogueList: { paddingHorizontal: 16, paddingTop: 12 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  avatarWrap: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '70%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  robotBubble: { backgroundColor: Colors.backgroundCard, borderBottomLeftRadius: 6 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 6 },
  bubbleText: { fontFamily: 'Cairo_400Regular', fontSize: 15, lineHeight: 24 },
  robotText: { color: Colors.text, textAlign: 'left' },
  userText: { color: '#fff', textAlign: 'right' },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  videoText: { fontFamily: 'Cairo_600SemiBold', fontSize: 18, color: Colors.textMuted },
  videoUrl: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: Colors.textSecondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row-reverse', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  completeBtn: {
    flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14,
  },
  completeBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: '#fff' },
  actionBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quizBtn: { backgroundColor: 'rgba(245,166,35,0.15)' },
  gameBtn: { backgroundColor: 'rgba(52,199,89,0.15)' },
});
