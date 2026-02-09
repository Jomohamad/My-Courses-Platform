import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addQuestion, getQuestions } from '@/lib/storage';

export default function AddQuestionScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const insets = useSafeAreaInsets();
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const updateOption = (index: number, text: string) => {
    setOptions(prev => {
      const newOpts = [...prev];
      newOpts[index] = text;
      return newOpts;
    });
  };

  const canSave = questionText.trim() && options.every(o => o.trim());

  const handleSave = async () => {
    if (!canSave || !lessonId) return;
    const existing = await getQuestions(lessonId);
    await addQuestion({
      lessonId,
      text: questionText.trim(),
      options: options.map(o => o.trim()),
      correctIndex,
      order: existing.length + 1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>سؤال جديد</Text>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !canSave && styles.saveBtnDisabled, { opacity: pressed ? 0.9 : 1 }]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Ionicons name="checkmark" size={24} color={canSave ? '#fff' : Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>نص السؤال</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={questionText}
          onChangeText={setQuestionText}
          placeholder="اكتب السؤال هنا..."
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
          multiline
        />

        <Text style={styles.label}>الاختيارات (اضغط لتحديد الإجابة الصحيحة)</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <Pressable
              style={[styles.radioBtn, correctIndex === index && styles.radioBtnActive]}
              onPress={() => setCorrectIndex(index)}
            >
              {correctIndex === index && <Ionicons name="checkmark" size={16} color="#fff" />}
            </Pressable>
            <TextInput
              style={[styles.optionInput, correctIndex === index && styles.optionInputActive]}
              value={option}
              onChangeText={(text) => updateOption(index, text)}
              placeholder={`الاختيار ${index + 1}`}
              placeholderTextColor={Colors.textMuted}
              textAlign="right"
            />
          </View>
        ))}
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
  label: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 10, marginTop: 8 },
  input: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.text, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 },
  radioBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioBtnActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  optionInput: {
    flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 14,
    fontFamily: 'Cairo_400Regular', fontSize: 15, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  optionInputActive: { borderColor: Colors.success },
});
