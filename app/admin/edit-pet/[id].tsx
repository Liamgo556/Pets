import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import PetForm from '@/components/admin/PetForm';
import { useAdminPets } from '@/hooks/usePets';
import { Pet } from '@/components/pets/PetCard';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { pets, updatePet, deletePet, loading } = useAdminPets();
  const [pet, setPet] = useState<Pet | null>(null);
  
  useEffect(() => {
    if (id && pets.length > 0) {
      const foundPet = pets.find(p => p.id === id);
      if (foundPet) {
        setPet(foundPet);
      }
    }
  }, [id, pets]);
  
  const handleUpdatePet = async (formData: any) => {
    try {
      if (!id) return;
      
      await updatePet(id, formData);
      router.back();
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  };
  
  const handleDeletePet = () => {
    const confirmDelete = () => {
      if (!id) return;
      
      deletePet(id)
        .then(() => {
          router.back();
        })
        .catch(error => {
          console.error('Error deleting pet:', error);
        });
    };
    
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this pet?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Pet',
        'Are you sure you want to delete this pet? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };
  
  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Pet</Text>
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pet details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Pet</Text>
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