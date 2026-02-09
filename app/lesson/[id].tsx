import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, ScrollView, Pressable, Platform, Animated as RNAnimated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/colors';
import { getLesson, getQuestions, getGames, setProgress } from '@/lib/storage';
import type { Lesson, DialogueMessage } from '@/lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([^&]+)/);
    videoId = match ? match[1] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([^?&]+)/);
    videoId = match ? match[1] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  if (url.includes('zen.yandex') || url.includes('dzen.ru')) {
    const match = url.match(/video\/([^/?]+)/);
    const zenId = match ? match[1] : null;
    if (zenId) return `https://dzen.ru/embed/${zenId}`;
    return url;
  }
  return url;
}

function VideoPlayer({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) {
    return (
      <View style={videoStyles.errorWrap}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={videoStyles.errorText}>رابط الفيديو غير صالح</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={videoStyles.container}>
        <View style={videoStyles.videoCard}>
          <View style={videoStyles.iframeWrap}>
            {/* @ts-ignore - iframe is valid in web */}
            <iframe
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 } as any}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </View>
          <View style={videoStyles.urlRow}>
            <Ionicons name="link-outline" size={16} color={Colors.textMuted} />
            <Text style={videoStyles.urlText} numberOfLines={1}>{url}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={videoStyles.container}>
      <View style={videoStyles.videoCard}>
        <WebView
          source={{ uri: embedUrl }}
          style={videoStyles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
        />
        <View style={videoStyles.urlRow}>
          <Ionicons name="link-outline" size={16} color={Colors.textMuted} />
          <Text style={videoStyles.urlText} numberOfLines={1}>{url}</Text>
        </View>
      </View>
    </View>
  );
}

const videoStyles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  videoCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  iframeWrap: {
    width: '100%', aspectRatio: 16 / 9, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    overflow: 'hidden', backgroundColor: '#000',
  },
  webview: {
    width: '100%', aspectRatio: 16 / 9, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    backgroundColor: '#000',
  },
  urlRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12,
  },
  urlText: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: Colors.textMuted, flex: 1 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: Colors.error },
});

function DialogueBubble({ message, isNew }: { message: DialogueMessage; isNew: boolean }) {
  const fadeAnim = useRef(new RNAnimated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new RNAnimated.Value(isNew ? 30 : 0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(isNew ? 0.85 : 1)).current;

  useEffect(() => {
    if (isNew) {
      RNAnimated.parallel([
        RNAnimated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
        RNAnimated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 120 }),
        RNAnimated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
      ]).start();
    }
  }, [isNew]);

  const isRobot = message.sender === 'robot';

  return (
    <RNAnimated.View style={[
      styles.bubbleWrap,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      },
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

function TypingIndicator() {
  const dot1 = useRef(new RNAnimated.Value(0.3)).current;
  const dot2 = useRef(new RNAnimated.Value(0.3)).current;
  const dot3 = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: RNAnimated.Value, delay: number) => {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          RNAnimated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
      <View style={styles.avatarWrap}>
        <Ionicons name="hardware-chip-outline" size={20} color={Colors.primary} />
      </View>
      <View style={[styles.bubble, styles.robotBubble, { flexDirection: 'row', gap: 6, paddingVertical: 16, paddingHorizontal: 20 }]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <RNAnimated.View
            key={i}
            style={{
              width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted,
              opacity: dot,
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasGame, setHasGame] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);
  const totalMessages = useRef(0);

  const loadData = useCallback(async () => {
    if (!id) return;
    const l = await getLesson(id);
    if (l) {
      setLesson(l);
      totalMessages.current = l.content?.length ?? 0;
    }
    const q = await getQuestions(id);
    setHasQuiz(q.length > 0);
    const g = await getGames(id);
    setHasGame(g.length > 0);
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const showNextMessage = useCallback(() => {
    if (!lesson?.content || visibleCount >= lesson.content.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextIndex = visibleCount;
    setAnimatingIndex(nextIndex);
    setVisibleCount(prev => prev + 1);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [visibleCount, lesson]);

  const markComplete = async () => {
    if (!id) return;
    await setProgress({ lessonId: id, completed: true, completedAt: Date.now() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!lesson) return null;

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const hasMoreMessages = lesson.type === 'dialogue' && lesson.content && visibleCount < lesson.content.length;
  const visibleMessages = lesson.content?.slice(0, visibleCount) ?? [];

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
        <View style={{ flex: 1 }}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(visibleCount / lesson.content.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{visibleCount} / {lesson.content.length}</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.dialogueList, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 140 }]}
            showsVerticalScrollIndicator={false}
          >
            {visibleMessages.map((msg, index) => (
              <DialogueBubble
                key={msg.id}
                message={msg}
                isNew={index === animatingIndex}
              />
            ))}

            {hasMoreMessages && <TypingIndicator />}
          </ScrollView>

          {hasMoreMessages && (
            <View style={[styles.nextMsgBar, { bottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 70 }]}>
              <Pressable
                style={({ pressed }) => [styles.nextMsgBtn, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                onPress={showNextMessage}
              >
                <Text style={styles.nextMsgText}>التالي</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      ) : lesson.type === 'video' && lesson.videoUrl ? (
        <VideoPlayer url={lesson.videoUrl} />
      ) : lesson.type === 'video' ? (
        <View style={videoStyles.errorWrap}>
          <Ionicons name="videocam-outline" size={48} color={Colors.textMuted} />
          <Text style={{ fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: Colors.textMuted }}>لا يوجد رابط فيديو</Text>
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
  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  progressBarBg: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.surface, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 2, backgroundColor: Colors.primary,
  },
  progressText: {
    fontFamily: 'Cairo_400Regular', fontSize: 12, color: Colors.textMuted, minWidth: 40, textAlign: 'center',
  },
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
  nextMsgBar: {
    position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10,
  },
  nextMsgBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 30, elevation: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  nextMsgText: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#fff' },
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
