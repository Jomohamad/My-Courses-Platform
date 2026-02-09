import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { addLesson, getLessons, generateId } from '@/lib/storage';
import type { DialogueMessage } from '@/lib/types';

export default function AddLessonScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'dialogue' | 'video'>('dialogue');
  const [videoUrl, setVideoUrl] = useState('');
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentSender, setCurrentSender] = useState<'robot' | 'user'>('robot');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const addDialogueMessage = () => {
    if (!newMessage.trim()) return;
    setDialogueMessages(prev => [
      ...prev,
      { id: generateId(), sender: currentSender, text: newMessage.trim() },
    ]);
    setNewMessage('');
    setCurrentSender(currentSender === 'robot' ? 'user' : 'robot');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeMessage = (id: string) => {
    setDialogueMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || !courseId) return;
    const lessons = await getLessons(courseId);
    const order = lessons.length + 1;

    await addLesson({
      courseId,
      title: title.trim(),
      type,
      order,
      content: type === 'dialogue' ? dialogueMessages : undefined,
      videoUrl: type === 'video' ? videoUrl.trim() : undefined,
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
        <Text style={styles.headerTitle}>حصة جديدة</Text>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, !title.trim() && styles.saveBtnDisabled, { opacity: pressed ? 0.9 : 1 }]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Ionicons name="checkmark" size={24} color={title.trim() ? '#fff' : Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>عنوان الحصة</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثال: مقدمة في البرمجة"
          placeholderTextColor={Colors.textMuted}
          textAlign="right"
        />

        <Text style={styles.label}>نوع الحصة</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeOption, type === 'dialogue' && styles.typeSelected]}
            onPress={() => setType('dialogue')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={type === 'dialogue' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.typeLabel, type === 'dialogue' && { color: Colors.primary }]}>حوار</Text>
          </Pressable>
          <Pressable
            style={[styles.typeOption, type === 'video' && styles.typeSelected]}
            onPress={() => setType('video')}
          >
            <Ionicons name="videocam-outline" size={24} color={type === 'video' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.typeLabel, type === 'video' && { color: Colors.primary }]}>فيديو</Text>
          </Pressable>
        </View>

        {type === 'video' && (
          <>
            <Text style={styles.label}>رابط الفيديو</Text>
            <TextInput
              style={styles.input}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.textMuted}
              textAlign="left"
              autoCapitalize="none"
              keyboardType="url"
            />
          </>
        )}

        {type === 'dialogue' && (
          <>
            <Text style={styles.label}>محتوى الحوار</Text>

            {dialogueMessages.map((msg, i) => (
              <View key={msg.id} style={[styles.dialogueItem, msg.sender === 'user' && styles.dialogueItemUser]}>
                <View style={[styles.dialogueAvatar, msg.sender === 'user' && { backgroundColor: Colors.accent }]}>
                  <Ionicons
                    name={msg.sender === 'robot' ? 'hardware-chip-outline' : 'person'}
                    size={16}
                    color={msg.sender === 'robot' ? Colors.primary : '#fff'}
                  />
                </View>
                <Text style={styles.dialogueText}>{msg.text}</Text>
                <Pressable onPress={() => removeMessage(msg.id)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </Pressable>
              </View>
            ))}

            <View style={styles.addMessageWrap}>
              <View style={styles.senderToggle}>
                <Pressable
                  style={[styles.senderBtn, currentSender === 'robot' && styles.senderBtnActive]}
                  onPress={() => setCurrentSender('robot')}
                >
                  <Ionicons name="hardware-chip-outline" size={16} color={currentSender === 'robot' ? '#fff' : Colors.textMuted} />
                </Pressable>
                <Pressable
                  style={[styles.senderBtn, currentSender === 'user' && styles.senderBtnActive]}
                  onPress={() => setCurrentSender('user')}
                >
                  <Ionicons name="person" size={16} color={currentSender === 'user' ? '#fff' : Colors.textMuted} />
                </Pressable>
              </View>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder={currentSender === 'robot' ? 'رسالة الروبوت...' : 'رسالتك...'}
                placeholderTextColor={Colors.textMuted}
                textAlign="right"
                multiline
              />
              <Pressable
                style={[styles.addMsgBtn, !newMessage.trim() && { opacity: 0.4 }]}
                onPress={addDialogueMessage}
                disabled={!newMessage.trim()}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </Pressable>
            </View>
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
  label: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 16,
    fontFamily: 'Cairo_400Regular', fontSize: 16, color: Colors.text, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 16 },
  typeOption: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16, borderRadius: 14,
    backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.border,
  },
  typeSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(10,143,143,0.1)' },
  typeLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: Colors.textMuted },
  dialogueItem: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 10,
    backgroundColor: Colors.backgroundCard, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  dialogueItemUser: { backgroundColor: Colors.surface },
  dialogueAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  dialogueText: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.text, flex: 1, textAlign: 'right' },
  removeBtn: { padding: 4 },
  addMessageWrap: {
    flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8,
    backgroundColor: Colors.backgroundCard, borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  senderToggle: { flexDirection: 'column', gap: 4 },
  senderBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  senderBtnActive: { backgroundColor: Colors.primary },
  messageInput: {
    flex: 1, fontFamily: 'Cairo_400Regular', fontSize: 14, color: Colors.text,
    minHeight: 40, maxHeight: 80,
  },
  addMsgBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
