import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { usePets, useFavoritePets } from '@/hooks/usePets';
import PetList from '@/components/pets/PetList';
import { Pet } from '@/components/pets/PetCard';
import BannerAd from '@/components/layout/BannerAd';

export default function FavoritesScreen() {
  const { pets, loading, refreshPets, refreshing } = usePets();
  const { favorites, toggleFavorite } = useFavoritePets();
  
  // Filter to only show favorited pets
  const favoritePets = pets.filter((pet: Pet) => favorites.has(pet.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Favorites</Text>
        <Text style={styles.subtitle}>Pets you've saved</Text>
      </View>
      
      <View style={styles.contentContainer}>
        {favoritePets.length === 0 && !loading ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No favorites yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Save pets you like by tapping the heart icon
            </Text>
          </View>
        ) : (
          <PetList
            pets={favoritePets}
            isLoading={loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onRefresh={refreshPets}
            isRefreshing={refreshing}
          />
        )}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});