import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  I18nManager,
} from 'react-native';
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
  const isRTL = I18nManager.isRTL;

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PetFilter onFilterChange={handleFilterChange} initialFilters={filters} />

      <View
        style={[
          styles.contentContainer,
          isRTL && styles.rtlDirection, // Support RTL on content
        ]}
      >
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
      <BannerAd position="bottom" />
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
  contentContainer: {
    flex: 1,
    ...Platform.select({
      web: {
        paddingHorizontal: 16,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: 100,
      },
    }),
  },
  rtlDirection: {
    flexDirection: 'row-reverse',
  },
});
