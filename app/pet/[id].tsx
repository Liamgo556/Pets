import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/components/pets/PetCard';
import { ChevronLeft, Heart, Phone } from 'lucide-react-native';
import { useFavoritePets } from '@/hooks/usePets';
import BannerAd from '@/components/layout/BannerAd';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavoritePets();

  useEffect(() => {
    async function fetchPet() {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setPet(data as Pet);
      } catch (error) {
        console.error('Error fetching pet:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPet();
  }, [id]);

  const handleCallOwner = () => {
    if (pet) {
      Linking.openURL(`tel:${pet.contact_phone}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleToggleFavorite = () => {
    if (pet) {
      toggleFavorite(pet.id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Pet not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ChevronLeft size={20} color="#6366F1" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isFavorite = favorites.has(pet.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.image_url }} style={styles.image} />
          
          <TouchableOpacity style={styles.backButtonOverlay} onPress={handleGoBack}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.favoriteButtonOverlay} onPress={handleToggleFavorite}>
            <Heart 
              size={24} 
              color="#FFFFFF" 
              fill={isFavorite ? '#EF4444' : 'transparent'}
              stroke={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.type}>
                {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} • {pet.age} {pet.age_unit}
              </Text>
            </View>
            
            {pet.is_friendly && (
              <View style={styles.friendlyBadge}>
                <Text style={styles.friendlyText}>Friendly</Text>
              </View>
            )}
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About</Text>
            <Text style={styles.description}>{pet.description}</Text>
          </View>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleCallOwner}>
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Call About This Pet</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Disclaimer: PetPals serves as a platform connecting pet owners with potential adopters. 
            We recommend meeting the pet and verifying all information before finalizing adoption.
          </Text>
        </View>
      </ScrollView>
      
      {/* Banner Ads (web only) */}
      <BannerAd position="left" />
      <BannerAd position="right" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    ...Platform.select({
      web: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1F2937',
  },
  type: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  friendlyBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  friendlyText: {
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  contactButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 4,
  },
});