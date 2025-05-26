import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/components/pets/PetCard';
import { FilterOptions } from '@/components/pets/PetFilter';
import { useAuth } from './useAuth';

// 🔍 usePets: Fetch pets with optional filters
export function usePets(options?: FilterOptions) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      setLoading(true);
      let query = supabase.from('pets').select('*');

      if (options) {
        if (options.type?.length) query = query.in('type', options.type);
        if (options.isFriendly !== null)
          query = query.eq('is_friendly', options.isFriendly);
        if (options.ageRange[0] !== null)
          query = query.gte('age', options.ageRange[0]);
        if (options.ageRange[1] !== null)
          query = query.lte('age', options.ageRange[1]);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      setPets(data as Pet[]);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [JSON.stringify(options)]);

  const refreshPets = async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  };

  return { pets, loading, error, refreshPets, refreshing };
}

// ❤️ useFavoritePets: Handle user favorite pets stored in the DB
export function useFavoritePets() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_favorites')
      .select('pet_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading favorites:', error.message);
      return;
    }

    const ids = data.map((row) => row.pet_id);
    setFavorites(new Set(ids));
  }, [user]);

  const toggleFavorite = useCallback(
    async (petId: string) => {
      if (!user) return;

      const isFav = favorites.has(petId);
      const updated = new Set(favorites);

      if (isFav) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pet_id', petId);
        if (error) {
          console.error('Error removing favorite:', error.message);
          return;
        }
        updated.delete(petId);
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{ user_id: user.id, pet_id: petId }]);
        if (error) {
          console.error('Error adding favorite:', error.message);
          return;
        }
        updated.add(petId);
      }

      setFavorites(updated);
    },
    [user, favorites]
  );

  useEffect(() => {
    if (user) loadFavorites();
    else setFavorites(new Set());
  }, [user, loadFavorites]);

  return { favorites, toggleFavorite };
}
