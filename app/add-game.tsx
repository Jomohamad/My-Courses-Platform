import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addGame, generateId } from '@/lib/storage';
import type { WordOrderData, MemoryData } from '@/lib/types';

export default function AddGameScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();
  const [gameType, setGameType] = useState<'word-order' | 'memory'>('word-order');
  const [title, setTitle] = useState('');

  const [sentence, setSentence] = useState('');

  const [pairs, setPairs] = useState<{ term: string; definition: string }[]>([
    { term: '', definition: '' },
    { term: '', definition: '' },
  ]);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const addPair = () => {
    setPairs(prev => [...prev, { term: '', definition: '' }]);
  };

  const updatePair = (index: number, field: 'term' | 'definition', value: string) => {
    setPairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], [field]: value };
      return newPairs;
    });
  };

  const removePair = (index: number) => {
    if (pairs.length <= 2) return;
    setPairs(prev => prev.filter((_, i) => i !== index));
  };

  const canSave = () => {
    if (!title.trim() || !lessonId) return false;
    if (gameType === 'word-order') return sentence.trim().length > 0;
    if (gameType === 'memory') return pairs.every(p => p.term.trim() && p.definition.trim());
    return false;
  };

  const handleSave = async () => {
    if (!canSave() || !lessonId) return;

    if (gameType === 'word-order') {
      const words = sentence.trim().split(' ');
      const data: WordOrderData = { sentence: sentence.trim(), words };
      await addGame({ lessonId, type: 'word-order', title: title.trim(), data });
    } else {
      const data: MemoryData = { pairs: pairs.map(p => ({ term: p.term.trim(), definition: p.definition.trim() })) };
      await addGame({ lessonId, type: 'memory', title: title.trim(), data });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>لعبة جديدة</Text>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !canSave() && styles.saveBtnDisabled, { opacity: pressed ? 0.9 : 1 }]}
          onPress={handleSave}
          disabled={!canSave()}
        >
          <Ionicons name="checkmark" size={24} color={canSave() ? '#fff' : Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>عنوان اللعبة</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: رتب الجملة"
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
        />

        <Text style={styles.label}>نوع اللعبة</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeOption, gameType === 'word-order' && styles.typeSelected]}
            onPress={() => setGameType('word-order')}
          >
            <Ionicons name="swap-horizontal-outline" size={24} color={gameType === 'word-order' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.typeLabel, gameType === 'word-order' && { color: Colors.primary }]}>ترتيب كلمات</Text>
          </Pressable>
          <Pressable
            style={[styles.typeOption, gameType === 'memory' && styles.typeSelected]}
            onPress={() => setGameType('memory')}
          >
            <Ionicons name="grid-outline" size={24} color={gameType === 'memory' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.typeLabel, gameType === 'memory' && { color: Colors.primary }]}>لعبة ذاكرة</Text>
          </Pressable>
        </View>

        {gameType === 'word-order' && (
          <>
            <Text style={styles.label}>الجملة الصحيحة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={sentence}
              onChangeText={setSentence}
              placeholder="اكتب الجملة كاملة وصحيحة"
              placeholderTextColor={Colors.textMuted}
              textAlign="right"
              multiline
            />
            <Text style={styles.hint}>سيتم تقسيم الجملة إلى كلمات وخلطها تلقائياً</Text>
          </>
        )}

        {gameType === 'memory' && (
          <>
            <Text style={styles.label}>الأزواج المتطابقة</Text>
            {pairs.map((pair, index) => (
              <View key={index} style={styles.pairRow}>
                <TextInput
                  style={styles.pairInput}
                  value={pair.term}
                  onChangeText={(text) => updatePair(index, 'term', text)}
                  placeholder="المصطلح"
                  placeholderTextColor={Colors.textMuted}
                  textAlign="right"
                />
                <Ionicons name="arrow-back" size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.pairInput}
                  value={pair.definition}
                  onChangeText={(text) => updatePair(index, 'definition', text)}
                  placeholder="التعريف"
                  placeholderTextColor={Colors.textMuted}
                  textAlign="right"
                />
                {pairs.length > 2 && (
                  <Pressable onPress={() => removePair(index)} style={styles.removePairBtn}>
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable style={styles.addPairBtn} onPress={addPair}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addPairText}>إضافة زوج</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: Colors.text },
  saveBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnDisabled: { backgroundColor: Colors.surface },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.text, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'right', marginBottom: 8 },
  typeRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 8 },
  typeOption: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16, borderRadius: 14,
    backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.border,
  },
  typeSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(10,143,143,0.1)' },
  typeLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textMuted },
  pairRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
  pairInput: {
    flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 12, padding: 12,
    fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  removePairBtn: { padding: 4 },
  addPairBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.primary, borderStyle: 'dashed', marginTop: 8,
  },
  addPairText: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.primary },
});
