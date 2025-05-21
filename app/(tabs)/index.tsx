import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import PetList from '@/components/pets/PetList';
import PetFilter, { FilterOptions } from '@/components/pets/PetFilter';
import { usePets, useFavoritePets } from '@/hooks/usePets';
import BannerAd from '@/components/layout/BannerAd';
import { useTranslation } from 'react-i18next';

const defaultFilters: FilterOptions = {
  type: [],
  isFriendly: null,
  ageRange: [null, null],
};

export default function BrowseScreen() {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const { pets, loading, refreshPets, refreshing } = usePets(filters);
  const { favorites, toggleFavorite } = useFavoritePets();
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView
      style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}
    >
      <PetFilter onFilterChange={handleFilterChange} initialFilters={filters} />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
    zIndex: 0,
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
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
});
