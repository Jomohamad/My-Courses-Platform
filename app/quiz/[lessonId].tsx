import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet, View, Text, Pressable, Platform, Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getQuestions, setProgress } from '@/lib/storage';
import type { Question } from '@/lib/types';

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const shakeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  useFocusEffect(useCallback(() => {
    if (!lessonId) return;
    getQuestions(lessonId).then(q => setQuestions(q));
  }, [lessonId]));

  const currentQuestion = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      RNAnimated.sequence([
        RNAnimated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        RNAnimated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      RNAnimated.sequence([
        RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
      if (lessonId) {
        await setProgress({
          lessonId,
          completed: true,
          quizScore: score + (selectedOption === currentQuestion.correctIndex ? 1 : 0),
          completedAt: Date.now(),
        });
      }
    }
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>لا توجد أسئلة</Text>
        </View>
      </View>
    );
  }

  if (finished) {
    const finalScore = score;
    const total = questions.length;
    const percentage = Math.round((finalScore / total) * 100);
    const isGood = percentage >= 70;

    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultCircle, { borderColor: isGood ? Colors.success : Colors.warning }]}>
            <Text style={styles.resultPercent}>{percentage}%</Text>
          </View>
          <Text style={styles.resultTitle}>
            {isGood ? 'أحسنت!' : 'حاول مرة أخرى'}
          </Text>
          <Text style={styles.resultDesc}>
            أجبت على {finalScore} من {total} أسئلة بشكل صحيح
          </Text>
          <View style={styles.resultActions}>
            <Pressable
              style={({ pressed }) => [styles.resultBtn, { opacity: pressed ? 0.9 : 1 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.resultBtnText}>رجوع</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.resultBtnSecondary, { opacity: pressed ? 0.9 : 1 }]}
              onPress={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setShowResult(false);
                setScore(0);
                setFinished(false);
              }}
            >
              <Text style={styles.resultBtnSecondaryText}>إعادة</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.progressWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{currentIndex + 1}/{questions.length}</Text>
        </View>
      </View>

      <RNAnimated.View style={[styles.questionSection, { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] }]}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </RNAnimated.View>

      <View style={styles.optionsWrap}>
        {currentQuestion.options.map((option, index) => {
          let optionStyle = styles.option;
          let textColor = Colors.text;
          if (showResult) {
            if (index === currentQuestion.correctIndex) {
              optionStyle = { ...styles.option, ...styles.optionCorrect };
              textColor = Colors.success;
            } else if (index === selectedOption && index !== currentQuestion.correctIndex) {
              optionStyle = { ...styles.option, ...styles.optionWrong };
              textColor = Colors.error;
            }
          }

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                optionStyle,
                selectedOption === index && !showResult && styles.optionSelected,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => handleSelect(index)}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
              {showResult && index === currentQuestion.correctIndex && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              )}
              {showResult && index === selectedOption && index !== currentQuestion.correctIndex && (
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              )}
            </Pressable>
          );
        })}
      </View>

      {showResult && (
        <View style={[styles.nextWrap, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
          <Pressable
            style={({ pressed }) => [styles.nextBtn, { opacity: pressed ? 0.9 : 1 }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
            </Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  progressWrap: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.surface },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  progressLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  questionSection: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24 },
  questionText: { fontFamily: 'Cairo_700Bold', fontSize: 22, color: Colors.text, textAlign: 'right', lineHeight: 36 },
  optionsWrap: { paddingHorizontal: 20, gap: 12 },
  option: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.backgroundCard, borderRadius: 16, padding: 18,
    borderWidth: 2, borderColor: 'transparent',
  },
  optionSelected: { borderColor: Colors.primary },
  optionCorrect: { borderColor: Colors.success, backgroundColor: 'rgba(52,199,89,0.1)' },
  optionWrong: { borderColor: Colors.error, backgroundColor: 'rgba(255,59,48,0.1)' },
  optionText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, flex: 1, textAlign: 'right' },
  nextWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12 },
  nextBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16,
  },
  nextBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: '#fff' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.textMuted },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  resultCircle: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  resultPercent: { fontFamily: 'Cairo_700Bold', fontSize: 40, color: Colors.text },
  resultTitle: { fontFamily: 'Cairo_700Bold', fontSize: 28, color: Colors.text },
  resultDesc: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  resultActions: { flexDirection: 'row-reverse', gap: 12, marginTop: 24 },
  resultBtn: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
  resultBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: '#fff' },
  resultBtnSecondary: { backgroundColor: Colors.backgroundCard, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
  resultBtnSecondaryText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: Colors.text },
});
