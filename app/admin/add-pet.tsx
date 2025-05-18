import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import PetForm from '@/components/admin/PetForm';
import { useAdminPets } from '@/hooks/usePets';

export default function AddPetScreen() {
  const router = useRouter();
  const { addPet, loading } = useAdminPets();
  
  const handleAddPet = async (formData: any) => {
    try {
      await addPet(formData);
      router.back();
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Pet</Text>
        <View style={styles.spacer} />
      </View>
      
      <PetForm onSubmit={handleAddPet} isLoading={loading} />
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
  spacer: {
    width: 40,
  },
});