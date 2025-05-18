import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import PetList from '@/components/pets/PetList';
import PetFilter, { FilterOptions } from '@/components/pets/PetFilter';
import { usePets, useFavoritePets } from '@/hooks/usePets';
import BannerAd from '@/components/layout/BannerAd';

const defaultFilters: FilterOptions = {
  type: [],
  isFriendly: null,
  ageRange: [null, null],
};

export default function BrowseScreen() {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const { pets, loading, refreshPets, refreshing } = usePets(filters);
  const { favorites, toggleFavorite } = useFavoritePets();

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PetPals Adoption</Text>
        <Text style={styles.subtitle}>Find your perfect companion</Text>
      </View>

      <View style={styles.filterContainer}>
        <PetFilter onFilterChange={handleFilterChange} initialFilters={filters} />
      </View>

      <View style={styles.contentContainer}>
        <PetList
          pets={pets}
          isLoading={loading}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onRefresh={refreshPets}
          isRefreshing={refreshing}
        />
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
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
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
});