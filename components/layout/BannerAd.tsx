import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

type BannerAdProps = {
  position: 'left' | 'right';
  adContent?: {
    imageUrl: string;
    linkUrl: string;
    altText: string;
  };
};

export default function BannerAd({ position, adContent }: BannerAdProps) {
  if (Platform.OS !== 'web') return null;

  const { width } = useWindowDimensions();

  if (width < 1024) return null;

  const handlePress = () => {
    if (adContent?.linkUrl) {
      Linking.openURL(adContent.linkUrl);
    }
  };

  const ad = adContent || {
    imageUrl:
      'https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    linkUrl: 'https://example.com',
    altText: 'Support pet adoption',
  };

  return (
    <View
      style={[
        styles.container,
        position === 'left' ? styles.left : styles.right,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.adWrapper}
      >
        <Image
          source={{ uri: ad.imageUrl }}
          style={styles.adImage}
          accessibilityLabel={ad.altText}
        />
        <Text style={styles.sponsoredLabel}>Sponsored</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: '50%',
    transform: [{ translateY: -150 }],
    zIndex: 1000,
    pointerEvents: 'box-none',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    left: 0,
    paddingLeft: 8,
  },
  right: {
    right: 0,
    paddingRight: 8,
  },
  adWrapper: {
    pointerEvents: 'auto',
    width: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  adImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  sponsoredLabel: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
