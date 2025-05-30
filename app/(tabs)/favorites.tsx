import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePets, useFavoritePets } from '@/hooks/usePets';
import PetList from '@/components/pets/PetList';
import { Pet } from '@/components/pets/PetCard';
import BannerAd from '@/components/layout/BannerAd';

export default function FavoritesScreen() {
  const { pets, loading, refreshPets, refreshing } = usePets();
  const { favorites, toggleFavorite } = useFavoritePets();
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  // Filter to only show favorited pets
  const favoritePets = pets.filter((pet: Pet) => favorites.has(pet.id));

  return (
    <SafeAreaView
      style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}
    >
      <View style={styles.contentContainer}>
        {favoritePets.length === 0 && !loading ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {t('favorites.emptyTitle')}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {t('favorites.emptySubtitle')}
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
