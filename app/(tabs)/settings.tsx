import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface UserProfile {
  full_name: string;
  avatar_url?: string;
  bio?: string;
}

interface UserSettings {
  notifications_enabled: boolean;
  dark_mode: boolean;
  language: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    lessonsCompleted: 0,
    totalScore: 0,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
      loadUserSettings();
      loadStats();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const completed = data?.filter(p => p.completed).length || 0;
      const totalScore = data?.reduce((sum, p) => sum + (p.quiz_score || 0), 0) || 0;

      setStats({
        coursesCompleted: Math.floor(completed / 4) || 0,
        lessonsCompleted: completed,
        totalScore,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد أنك تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch (err) {
            Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هل أنت متأكد؟ سيؤدي هذا إلى حذف جميع بيانات الحساب بشكل نهائي',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              // In production, call an edge function to delete the user account
              await signOut();
              router.replace('/login');
              Alert.alert('تم', 'تم حذف حسابك بنجاح');
            } catch (err) {
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الحساب');
            }
          },
        },
      ]
    );
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      setSettings(prev => prev ? { ...prev, notifications_enabled: value } : null);
      const { error } = await supabase
        .from('user_settings')
        .update({ notifications_enabled: value })
        .eq('user_id', user?.id);

      if (error) throw error;
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ في تحديث الإعدادات');
      loadUserSettings();
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    try {
      setSettings(prev => prev ? { ...prev, dark_mode: value } : null);
      const { error } = await supabase
        .from('user_settings')
        .update({ dark_mode: value })
        .eq('user_id', user?.id);

      if (error) throw error;
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ في تحديث الإعدادات');
      loadUserSettings();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#0A8F8F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.coursesCompleted}</Text>
            <Text style={styles.statLabel}>كورسات مكتملة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>دروس مكتملة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalScore}</Text>
            <Text style={styles.statLabel}>نقاط</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>حسابي</Text>

        <View style={styles.sectionContent}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person" size={20} color="#0A8F8F" />
              <Text style={styles.settingLabel}>الاسم</Text>
            </View>
            <Text style={styles.settingValue}>{profile?.full_name}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={20} color="#0A8F8F" />
              <Text style={styles.settingLabel}>البريد الإلكتروني</Text>
            </View>
            <Text style={styles.settingValue}>{user?.email}</Text>
          </View>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Text style={styles.settingLink}>تغيير كلمة المرور</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التفضيلات</Text>

        <View style={styles.sectionContent}>
          <View style={styles.switchItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color="#0A8F8F" />
              <Text style={styles.settingLabel}>الإشعارات</Text>
            </View>
            {settings && (
              <Switch
                value={settings.notifications_enabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#e0e0e0', true: '#0A8F8F40' }}
                thumbColor={settings.notifications_enabled ? '#0A8F8F' : '#ccc'}
              />
            )}
          </View>

          <View style={styles.switchItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color="#0A8F8F" />
              <Text style={styles.settingLabel}>الوضع الليلي</Text>
            </View>
            {settings && (
              <Switch
                value={settings.dark_mode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#e0e0e0', true: '#0A8F8F40' }}
                thumbColor={settings.dark_mode ? '#0A8F8F' : '#ccc'}
              />
            )}
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الخطر</Text>

        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out" size={20} color="#E85D75" />
              <Text style={[styles.settingLabel, styles.dangerText]}>تسجيل الخروج</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#E85D75" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={20} color="#E85D75" />
              <Text style={[styles.settingLabel, styles.dangerText]}>حذف الحساب</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#E85D75" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>الإصدار 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  headerSection: {
    padding: 20,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#0A8F8F20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A8F8F',
    fontFamily: 'Cairo_700Bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    fontFamily: 'Cairo_600SemiBold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Cairo_400Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A8F8F',
    marginBottom: 4,
    fontFamily: 'Cairo_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Cairo_400Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    fontFamily: 'Cairo_600SemiBold',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Cairo_400Regular',
  },
  settingValue: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Cairo_400Regular',
  },
  settingLink: {
    fontSize: 16,
    color: '#0A8F8F',
    fontFamily: 'Cairo_400Regular',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#E85D75',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Cairo_400Regular',
  },
});
