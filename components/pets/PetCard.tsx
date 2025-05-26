import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Heart, MapPin, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

export type Pet = {
  id: string;
  name: string;
  age: number;
  age_unit: 'days' | 'months' | 'years';
  type: 'dog' | 'cat' | 'other';
  is_friendly: boolean;
  image_url: string;
  description: string;
  created_at: string;
  contact_phone: string;
};

type PetCardProps = {
  pet: Pet;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  index?: number;
};

// const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
// const CARD_WIDTH = Platform.OS === 'web' ? 380 : width - CARD_MARGIN * 2;

export default function PetCard({
  pet,
  isFavorite = false,
  onToggleFavorite,
  index = 0,
}: PetCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 100;
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.05, { damping: 12 }),
        withSpring(1, { damping: 15 })
      )
    );
    opacity.value = withDelay(delay, withSpring(1));
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 12 })
    );
    router.push(`/pet/${pet.id}`);
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const getAgeDisplay = () => {
    const unitKey = `form.units.${pet.age_unit}`; // e.g. form.units.days
    const label = t(unitKey);
    return `${pet.age} ${label}`;
  };

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.image_url }} style={styles.image} />
          {pet.is_friendly && (
            <View style={styles.friendlyBadge}>
              <Text style={styles.friendlyText}>{t('form.friendly')}</Text>
            </View>
          )}
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.favoriteButton}
            >
              <Heart
                size={22}
                color={isFavorite ? '#EF4444' : '#FFFFFF'}
                fill={isFavorite ? '#EF4444' : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{t(`form.types.${pet.type}`)}</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.detailText}>{getAgeDisplay()}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {t('common.available', 'Available')}
              </Text>
            </View>
          </View>

          <Text
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {pet.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  friendlyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  friendlyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  typeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  type: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 22,
    height: 44,
    overflow: 'hidden',
  },
});
