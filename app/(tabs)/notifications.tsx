import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  registerForPushNotifications,
  subscribeToNewPets,
  unsubscribeFromNewPets,
} from '@/lib/notification';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Bell } from 'lucide-react-native';
import BannerAd from '@/components/layout/BannerAd';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<
    { id: string; title: string; body: string; date: string }[]
  >([]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function loadPreferences() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('notifications_new_pets')
            .eq('user_id', user.id)
            .single();

          if (data) {
            setNotificationsEnabled(data.notifications_new_pets);
          }
        } catch (error) {
          console.error('Error loading preferences:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function loadAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          date: new Date(item.created_at).toLocaleDateString(),
        }));

        setAnnouncements(formatted);
      } catch (error) {
        console.error('Error loading announcements:', error);
      }
    }

    loadAnnouncements();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const token = await registerForPushNotifications();
      if (token) await subscribeToNewPets();
      else setNotificationsEnabled(false);
    } else {
      await unsubscribeFromNewPets();
    }
  };

  if (Platform.OS === 'web') return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.notificationSettingsContainer}>
          <Text style={styles.sectionTitle}>{t('notifications.settings')}</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                {t('notifications.newPetAlerts')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('notifications.description')}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              disabled={loading}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.announcementsContainer}>
          <Text style={styles.sectionTitle}>
            {t('notifications.announcements')}
          </Text>

          {announcements.length === 0 ? (
            <View style={styles.emptyAnnouncementsContainer}>
              <Bell size={48} color="#9CA3AF" />
              <Text style={styles.emptyAnnouncementsText}>
                {t('notifications.noAnnouncements')}
              </Text>
            </View>
          ) : (
            announcements.map((item) => (
              <TouchableOpacity key={item.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  <Text style={styles.announcementDate}>{item.date}</Text>
                </View>
                <Text style={styles.announcementBody}>{item.body}</Text>
              </TouchableOpacity>
            ))
          )}

          {/* Demo entries */}
          <TouchableOpacity style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <Text style={styles.announcementTitle}>
                {t('notifications.demo1Title')}
              </Text>
              <Text style={styles.announcementDate}>
                {t('notifications.demo1Date')}
              </Text>
            </View>
            <Text style={styles.announcementBody}>
              {t('notifications.demo1Body')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <Text style={styles.announcementTitle}>
                {t('notifications.demo2Title')}
              </Text>
              <Text style={styles.announcementDate}>
                {t('notifications.demo2Date')}
              </Text>
            </View>
            <Text style={styles.announcementBody}>
              {t('notifications.demo2Body')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BannerAd position="left" />
      <BannerAd position="right" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, color: '#1F2937' },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    ...Platform.select({
      web: {
        paddingHorizontal: 16,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  notificationSettingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontFamily: 'Inter-Medium', fontSize: 16, color: '#1F2937' },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  announcementsContainer: { padding: 16 },
  emptyAnnouncementsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyAnnouncementsText: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  announcementDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  announcementBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
