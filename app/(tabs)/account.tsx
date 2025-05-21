import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import { LogOut, PlusCircle, Settings, RefreshCw } from 'lucide-react-native';
import { useAdminPets } from '@/hooks/usePets';
import { useRouter } from 'expo-router';
import BannerAd from '@/components/layout/BannerAd';
import { useTranslation } from 'react-i18next';

export default function AccountScreen() {
  const { user, isAdmin, signOut } = useAuth();
  const { pets, loading: petsLoading, refreshPets } = useAdminPets();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const handleSignOut = async () => {
    const confirmText = t('auth.signOutConfirm');
    const confirmBtn = t('auth.signOut');

    if (Platform.OS === 'web') {
      if (window.confirm(confirmText)) {
        await signOut();
      }
    } else {
      Alert.alert(t('auth.signOut'), confirmText, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: confirmBtn, style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const handleAddNewPet = () => {
    router.push('/admin/add-pet');
  };

  const handleEditPet = (petId: string) => {
    router.push(`/admin/edit-pet/${petId}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPets();
    setIsRefreshing(false);
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <AuthForm onSuccess={() => {}} />
        </View>

        <BannerAd position="left" />
        <BannerAd position="right" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.adminContainer}>
        <View
          style={[
            styles.adminHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View>
            <Text style={styles.welcomeText}>{t('admin.welcome')}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={24}
                color="#6366F1"
                style={isRefreshing ? styles.spinningIcon : undefined}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
              <LogOut size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
          onPress={handleAddNewPet}
        >
          <PlusCircle size={20} color="#FFFFFF" />
          <Text
            style={[
              styles.addButtonText,
              { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
            ]}
          >
            {t('admin.addPet')}
          </Text>
        </TouchableOpacity>

        <View style={styles.petsListContainer}>
          <Text style={styles.sectionTitle}>
            {petsLoading
              ? t('admin.loadingPets')
              : `${t('admin.managePets')} (${pets.length})`}
          </Text>

          <ScrollView>
            {petsLoading ? (
              <Text style={styles.loadingText}>{t('admin.loadingPets')}</Text>
            ) : pets.length === 0 ? (
              <Text style={styles.emptyText}>{t('admin.noPets')}</Text>
            ) : (
              pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petItem,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                  onPress={() => handleEditPet(pet.id)}
                >
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDetails}>
                      {pet.age} {t(`form.units.${pet.age_unit}`)} •{' '}
                      {t(`form.types.${pet.type}`)}
                      {pet.is_friendly ? ` • ${t('form.friendly')}` : ''}
                    </Text>
                  </View>
                  <Settings size={20} color="#6B7280" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <BannerAd position="left" />
      <BannerAd position="right" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  adminContainer: {
    flex: 1,
    padding: 16,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  welcomeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  emailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  adminActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  spinningIcon: {
    transform: [{ rotate: '45deg' }],
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  petsListContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  petItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  petDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
