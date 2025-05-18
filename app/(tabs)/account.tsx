import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import { LogOut, PlusCircle, Settings, RefreshCw } from 'lucide-react-native';
import { useAdminPets } from '@/hooks/usePets';
import { useRouter } from 'expo-router';
import BannerAd from '@/components/layout/BannerAd';

export default function AccountScreen() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const { pets, loading: petsLoading, refreshPets } = useAdminPets();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to sign out?')) {
        await signOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut }
        ]
      );
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
        <View style={styles.header}>
          <Text style={styles.title}>Admin Access</Text>
          <Text style={styles.subtitle}>Sign in to manage pets</Text>
        </View>
        
        <View style={styles.authContainer}>
          <AuthForm onSuccess={() => {}} />
        </View>
        
        {/* Banner Ads (web only) */}
        <BannerAd position="left" />
        <BannerAd position="right" />
        <BannerAd position="top" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage pets for adoption</Text>
      </View>
      
      <View style={styles.adminContainer}>
        <View style={styles.adminHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome, Admin</Text>
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
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewPet}>
          <PlusCircle size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Pet</Text>
        </TouchableOpacity>
        
        <View style={styles.petsListContainer}>
          <Text style={styles.sectionTitle}>
            {petsLoading ? 'Loading pets...' : `Manage Pets (${pets.length})`}
          </Text>
          
          <ScrollView>
            {petsLoading ? (
              <Text style={styles.loadingText}>Loading pets...</Text>
            ) : pets.length === 0 ? (
              <Text style={styles.emptyText}>No pets added yet</Text>
            ) : (
              pets.map(pet => (
                <TouchableOpacity 
                  key={pet.id} 
                  style={styles.petItem}
                  onPress={() => handleEditPet(pet.id)}
                >
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDetails}>
                      {pet.age} {pet.age_unit} • {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                      {pet.is_friendly ? ' • Friendly' : ''}
                    </Text>
                  </View>
                  
                  <Settings size={20} color="#6B7280" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Banner Ads (web only) */}
      <BannerAd position="left" />
      <BannerAd position="right" />
      <BannerAd position="top" />
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