import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import PetList from '@/components/pets/PetList';
import PetFilter, { FilterOptions } from '@/components/pets/PetFilter';
import { Pet } from '@/components/pets/PetCard';
import { useFavoritePets } from '@/hooks/usePets';
import BannerAd from '@/components/layout/BannerAd';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { favorites, toggleFavorite } = useFavoritePets();
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    isFriendly: null,
    ageRange: [null, null],
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setSearched(true);
      
      let query = supabase
        .from('pets')
        .select('*')
        .ilike('name', `%${searchQuery}%`);
      
      // Apply filters
      if (filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      
      if (filters.isFriendly !== null) {
        query = query.eq('is_friendly', filters.isFriendly);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSearchResults(data as Pet[]);
    } catch (error) {
      console.error('Error searching pets:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Re-search if we've already searched before
    if (searched) {
      handleSearch();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Pets</Text>
        <Text style={styles.subtitle}>Find your next companion</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by pet name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        
        <View style={styles.filterContainer}>
          <PetFilter onFilterChange={handleFilterChange} initialFilters={filters} />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        {!searched ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Search for pets by name</Text>
            <Text style={styles.emptyStateSubtext}>Use filters to narrow your search</Text>
          </View>
        ) : (
          <PetList
            pets={searchResults}
            isLoading={loading}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterContainer: {
    marginTop: 16,
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