import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PetCard, { Pet } from './PetCard';
import Animated, { FadeIn } from 'react-native-reanimated';

type PetListProps = {
  pets: Pet[];
  isLoading: boolean;
  favorites?: Set<string>;
  onToggleFavorite?: (petId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const { width } = Dimensions.get('window');
const BANNER_WIDTH = 160;

export default function PetList({
  pets,
  isLoading,
  favorites,
  onToggleFavorite,
  onRefresh,
  isRefreshing = false,
}: PetListProps) {
  const { t } = useTranslation();

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>{t('petList.loading')}</Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyText}>{t('petList.emptyTitle')}</Text>
        <Text style={styles.emptySubtext}>{t('petList.emptySubtitle')}</Text>
      </Animated.View>
    );
  }

  const bannerPadding = BANNER_WIDTH + 12;

  if (Platform.OS === 'web') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.webGridContainer,
          {
            paddingLeft: bannerPadding,
            paddingRight: bannerPadding,
            columnGap: 24,
          },
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {pets.map((pet, index) => (
          <View key={pet.id} style={styles.webGridItem}>
            <PetCard
              pet={pet}
              index={index}
              isFavorite={favorites?.has(pet.id)}
              onToggleFavorite={
                onToggleFavorite ? () => onToggleFavorite(pet.id) : undefined
              }
            />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.mobileContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {pets.map((pet, index) => (
        <PetCard
          key={pet.id}
          pet={pet}
          index={index}
          isFavorite={favorites?.has(pet.id)}
          onToggleFavorite={
            onToggleFavorite ? () => onToggleFavorite(pet.id) : undefined
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mobileContainer: { paddingVertical: 16 },
  webGridContainer: {
    paddingVertical: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  webGridItem: {
    width: 360,
    margin: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});
