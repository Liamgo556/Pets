import React, { useEffect, useState } from 'react';
import {
  Alert,
  I18nManager,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react-native';
import PetForm from '@/components/admin/PetForm';
import { useAdminPets } from '@/hooks/usePets';
import { Pet } from '@/components/pets/PetCard';
import { useTranslation } from 'react-i18next';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { pets, updatePet, deletePet, loading } = useAdminPets();
  const [pet, setPet] = useState<Pet | null>(null);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    if (id && pets.length > 0) {
      const foundPet = pets.find((p) => p.id === id);
      if (foundPet) {
        setPet(foundPet);
      }
    }
  }, [id, pets]);

  const handleUpdatePet = async (formData: any) => {
    if (!id) return;
    try {
      await updatePet(id, formData);
      router.back();
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  };

  const handleDeletePet = () => {
    const confirmDelete = async () => {
      if (!id) return;
      try {
        await deletePet(id);
        router.back();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(t('form.confirmDeleteWeb'))) {
        confirmDelete();
      }
    } else {
      Alert.alert(t('form.confirmDeleteTitle'), t('form.confirmDeleteMsg'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('form.delete'),
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]);
    }
  };

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            {isRTL ? (
              <ChevronRight size={24} color="#1F2937" />
            ) : (
              <ChevronLeft size={24} color="#1F2937" />
            )}
          </TouchableOpacity>
          <Text style={styles.title}>{t('form.edit')}</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('form.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          {isRTL ? (
            <ChevronRight size={24} color="#1F2937" />
          ) : (
            <ChevronLeft size={24} color="#1F2937" />
          )}
        </TouchableOpacity>

        <Text style={styles.title}>{t('form.edit')}</Text>

        <TouchableOpacity onPress={handleDeletePet} style={styles.deleteButton}>
          <Trash2 size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <PetForm pet={pet} onSubmit={handleUpdatePet} isLoading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
  },
  deleteButton: {
    padding: 8,
  },
  spacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
});
