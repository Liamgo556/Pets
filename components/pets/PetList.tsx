import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, Platform, ScrollView, Dimensions } from 'react-native';
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
const GRID_MARGIN = width > 1200 ? 32 : 16;

export default function PetList({
  pets,
  isLoading,
  favorites,
  onToggleFavorite,
  onRefresh,
  isRefreshing = false,
}: PetListProps) {
  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Finding perfect companions...</Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyText}>No pets found</Text>
        <Text style={styles.emptySubtext}>
          Check back later for new adoptable pets!
        </Text>
      </Animated.View>
    );
  }

  // On web, we'll use a ScrollView with a grid layout
  if (Platform.OS === 'web') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.webGridContainer,
          { paddingHorizontal: GRID_MARGIN }
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

  // On mobile, we'll use a ScrollView with a single column
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
  container: {
    flex: 1,
  },
  mobileContainer: {
    paddingVertical: 16,
  },
  webGridContainer: {
    paddingVertical: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  webGridItem: {
    width: 'auto',
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