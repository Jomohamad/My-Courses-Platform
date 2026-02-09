import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addCourse } from '@/lib/storage';

const COLORS = ['#0A8F8F', '#F5A623', '#E85D75', '#6C5CE7', '#00B894', '#FD79A8', '#636E72', '#2D3436'];
const ICONS: { name: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { name: 'code-slash', label: 'برمجة' },
  { name: 'globe-outline', label: 'ويب' },
  { name: 'calculator-outline', label: 'رياضيات' },
  { name: 'book-outline', label: 'كتاب' },
  { name: 'flask-outline', label: 'علوم' },
  { name: 'musical-notes-outline', label: 'موسيقى' },
  { name: 'brush-outline', label: 'فنون' },
  { name: 'language-outline', label: 'لغات' },
];

export default function AddCourseScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].name);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleSave = async () => {
    if (!title.trim()) return;
    await addCourse({
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      icon: selectedIcon,
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
        <Text style={styles.headerTitle}>كورس جديد</Text>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !title.trim() && styles.saveBtnDisabled, { opacity: pressed ? 0.9 : 1 }]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Ionicons name="checkmark" size={24} color={title.trim() ? '#fff' : Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
            <Ionicons name={selectedIcon} size={32} color="#fff" />
          </View>
          <Text style={styles.previewTitle}>{title || 'عنوان الكورس'}</Text>
        </View>

        <Text style={styles.label}>عنوان الكورس</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: أساسيات البرمجة"
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
        />

        <Text style={styles.label}>وصف الكورس</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="اكتب وصف مختصر للكورس"
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>اللون</Text>
        <View style={styles.colorRow}>
          {COLORS.map(color => (
            <Pressable
              key={color}
              style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorSelected]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <Text style={styles.label}>الأيقونة</Text>
        <View style={styles.iconRow}>
          {ICONS.map(icon => (
            <Pressable
              key={icon.name}
              style={[styles.iconOption, selectedIcon === icon.name && styles.iconSelected]}
              onPress={() => setSelectedIcon(icon.name)}
            >
              <Ionicons name={icon.name} size={24} color={selectedIcon === icon.name ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.iconLabel, selectedIcon === icon.name && { color: Colors.primary }]}>{icon.label}</Text>
            </Pressable>
          ))}
        </View>
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
  previewCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 24 },
  previewIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  previewTitle: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: Colors.text },
  label: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 8 },
  input: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.text, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorOption: { width: 40, height: 40, borderRadius: 12 },
  colorSelected: { borderWidth: 3, borderColor: '#fff' },
  iconRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  iconOption: {
    alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  iconSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(10,143,143,0.1)' },
  iconLabel: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: Colors.textSecondary },
});
