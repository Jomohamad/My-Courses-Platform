import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, Pressable, Platform, ScrollView, Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getGames } from '@/lib/storage';
import type { Game, WordOrderData, MemoryData } from '@/lib/types';

function WordOrderGame({ data }: { data: WordOrderData }) {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const shuffled = [...data.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(null);
  }, [data]);

  const addWord = (word: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== index));
  };

  const removeWord = (word: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAvailableWords(prev => [...prev, word]);
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    const correct = selectedWords.join(' ') === data.sentence;
    setIsCorrect(correct);
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const reset = () => {
    const shuffled = [...data.words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(null);
  };

  return (
    <View style={styles.gameContent}>
      <Text style={styles.gameInstruction}>رتب الكلمات لتكوين جملة صحيحة</Text>

      <View style={[
        styles.sentenceArea,
        isCorrect === true && styles.sentenceCorrect,
        isCorrect === false && styles.sentenceWrong,
      ]}>
        {selectedWords.length === 0 ? (
          <Text style={styles.sentencePlaceholder}>اضغط على الكلمات لترتيبها</Text>
        ) : (
          <View style={styles.wordsRow}>
            {selectedWords.map((word, i) => (
              <Pressable key={`s-${i}`} style={styles.selectedWord} onPress={() => removeWord(word, i)}>
                <Text style={styles.selectedWordText}>{word}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.wordsRow}>
        {availableWords.map((word, i) => (
          <Pressable key={`a-${i}`} style={styles.availableWord} onPress={() => addWord(word, i)}>
            <Text style={styles.availableWordText}>{word}</Text>
          </Pressable>
        ))}
      </View>

      {isCorrect !== null && (
        <View style={styles.resultBanner}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isCorrect ? Colors.success : Colors.error}
          />
          <Text style={[styles.resultText, { color: isCorrect ? Colors.success : Colors.error }]}>
            {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة، حاول مرة أخرى'}
          </Text>
        </View>
      )}

      <View style={styles.gameActions}>
        {selectedWords.length === data.words.length && isCorrect === null && (
          <Pressable style={({ pressed }) => [styles.checkBtn, { opacity: pressed ? 0.9 : 1 }]} onPress={checkAnswer}>
            <Text style={styles.checkBtnText}>تحقق</Text>
          </Pressable>
        )}
        {isCorrect === false && (
          <Pressable style={({ pressed }) => [styles.resetBtn, { opacity: pressed ? 0.9 : 1 }]} onPress={reset}>
            <Ionicons name="refresh" size={20} color={Colors.text} />
            <Text style={styles.resetBtnText}>إعادة</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MemoryGame({ data }: { data: MemoryData }) {
  interface Card { id: string; text: string; pairId: number; type: 'term' | 'definition' }

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const allCards: Card[] = [];
    data.pairs.forEach((pair, i) => {
      allCards.push({ id: `t-${i}`, text: pair.term, pairId: i, type: 'term' });
      allCards.push({ id: `d-${i}`, text: pair.definition, pairId: i, type: 'definition' });
    });
    setCards(allCards.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  }, [data]);

  const flipCard = (cardId: string) => {
    if (isChecking || flipped.includes(cardId) || matched.includes(cardId)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const card1 = cards.find(c => c.id === newFlipped[0])!;
      const card2 = cards.find(c => c.id === newFlipped[1])!;

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        setTimeout(() => {
          setMatched(prev => [...prev, newFlipped[0], newFlipped[1]]);
          setFlipped([]);
          setIsChecking(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 1000);
      }
    }
  };

  const isFinished = matched.length === cards.length && cards.length > 0;

  return (
    <View style={styles.gameContent}>
      <Text style={styles.gameInstruction}>اوجد الأزواج المتطابقة</Text>

      <View style={styles.memoryGrid}>
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <Pressable
              key={card.id}
              style={[
                styles.memoryCard,
                isFlipped && styles.memoryCardFlipped,
                isMatched && styles.memoryCardMatched,
              ]}
              onPress={() => flipCard(card.id)}
            >
              {isFlipped || isMatched ? (
                <Text style={[styles.memoryCardText, isMatched && { color: Colors.success }]}>{card.text}</Text>
              ) : (
                <Ionicons name="help" size={24} color={Colors.textMuted} />
              )}
            </Pressable>
          );
        })}
      </View>

      {isFinished && (
        <View style={styles.resultBanner}>
          <Ionicons name="trophy" size={24} color={Colors.accent} />
          <Text style={[styles.resultText, { color: Colors.accent }]}>أحسنت! أنهيت اللعبة</Text>
        </View>
      )}
    </View>
  );
}

export default function GameScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<Game[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!lessonId) return;
    getGames(lessonId).then(g => setGames(g));
  }, [lessonId]));

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (games.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.emptyState}>
          <Ionicons name="game-controller-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>لا توجد ألعاب</Text>
        </View>
      </View>
    );
  }

  const currentGame = games[currentGameIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{currentGame.title}</Text>
        {games.length > 1 && (
          <View style={styles.gameTabs}>
            {games.map((_, i) => (
              <Pressable
                key={i}
                style={[styles.gameTab, i === currentGameIndex && styles.gameTabActive]}
                onPress={() => setCurrentGameIndex(i)}
              >
                <View style={[styles.gameTabDot, i === currentGameIndex && styles.gameTabDotActive]} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }}
        showsVerticalScrollIndicator={false}
      >
        {currentGame.type === 'word-order' && (
          <WordOrderGame data={currentGame.data as WordOrderData} />
        )}
        {currentGame.type === 'memory' && (
          <MemoryGame data={currentGame.data as MemoryData} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Cairo_600SemiBold', fontSize: 18, color: Colors.text, flex: 1, textAlign: 'right' },
  gameTabs: { flexDirection: 'row-reverse', gap: 6 },
  gameTab: { padding: 4 },
  gameTabActive: {},
  gameTabDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surface },
  gameTabDotActive: { backgroundColor: Colors.primary, width: 20, borderRadius: 4 },
  scrollArea: { flex: 1 },
  gameContent: { paddingHorizontal: 20, paddingTop: 20 },
  gameInstruction: { fontFamily: 'Cairo_600SemiBold', fontSize: 18, color: Colors.text, textAlign: 'right', marginBottom: 24 },
  sentenceArea: {
    minHeight: 80, backgroundColor: Colors.backgroundCard, borderRadius: 16,
    padding: 16, marginBottom: 24, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center',
  },
  sentenceCorrect: { borderColor: Colors.success },
  sentenceWrong: { borderColor: Colors.error },
  sentencePlaceholder: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  wordsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  selectedWord: {
    backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  selectedWordText: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#fff' },
  availableWord: {
    backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  availableWordText: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: Colors.text },
  resultBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    backgroundColor: Colors.backgroundCard, padding: 16, borderRadius: 14, marginTop: 24,
  },
  resultText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16 },
  gameActions: { marginTop: 20, gap: 12 },
  checkBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  checkBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: '#fff' },
  resetBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.backgroundCard, paddingVertical: 14, borderRadius: 14,
  },
  resetBtnText: { fontFamily: 'Cairo_600SemiBold', fontSize: 16, color: Colors.text },
  memoryGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  memoryCard: {
    width: '45%', aspectRatio: 1.4, backgroundColor: Colors.backgroundCard, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  memoryCardFlipped: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  memoryCardMatched: { borderColor: Colors.success, backgroundColor: 'rgba(52,199,89,0.1)' },
  memoryCardText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.text, textAlign: 'center', paddingHorizontal: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.textMuted },
});
