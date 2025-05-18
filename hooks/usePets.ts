import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/components/pets/PetCard';
import { FilterOptions } from '@/components/pets/PetFilter';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Storage adapter for handling favorites across platforms
const storage = {
  async setItem(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (e) {
      console.error('Error reading from storage:', e);
      return null;
    }
  }
};

export function usePets(options?: FilterOptions) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      let query = supabase.from('pets').select('*');

      // Apply filters
      if (options) {
        // Filter by pet type
        if (options.type && options.type.length > 0) {
          query = query.in('type', options.type);
        }

        // Filter by friendly status
        if (options.isFriendly !== null) {
          query = query.eq('is_friendly', options.isFriendly);
        }

        // Filter by age range
        if (options.ageRange[0] !== null) {
          query = query.gte('age', options.ageRange[0]);
        }
        if (options.ageRange[1] !== null) {
          query = query.lte('age', options.ageRange[1]);
        }
      }

      // Order by newest first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setPets(data as Pet[]);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPets();
  }, [options]);

  // Function to refresh pets
  const refreshPets = async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  };

  return { pets, loading, error, refreshPets, refreshing };
}

export function useFavoritePets() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (petId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(petId)) {
        newFavorites.delete(petId);
      } else {
        newFavorites.add(petId);
      }
      // Save to storage
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  // Load favorites from storage on init
  useEffect(() => {
    loadFavorites();
  }, []);

  const saveFavorites = async (favs: Set<string>) => {
    try {
      const favsArray = Array.from(favs);
      await storage.setItem('petpals-favorites', JSON.stringify(favsArray));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  };

  const loadFavorites = async () => {
    try {
      const savedFavs = await storage.getItem('petpals-favorites');
      if (savedFavs) {
        const favsArray = JSON.parse(savedFavs);
        setFavorites(new Set(favsArray));
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  };

  return { favorites, toggleFavorite };
}

export function useAdminPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setPets(data as Pet[]);
    } catch (err: any) {
      console.error('Error fetching pets for admin:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (pet: Omit<Pet, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .insert([pet])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh pet list
      await fetchPets();
      return data;
    } catch (err: any) {
      console.error('Error adding pet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePet = async (id: string, pet: Omit<Pet, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh pet list
      await fetchPets();
      return data;
    } catch (err: any) {
      console.error('Error updating pet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh pet list
      await fetchPets();
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPets();
  }, []);

  return { pets, loading, error, addPet, updatePet, deletePet, refreshPets: fetchPets };
}