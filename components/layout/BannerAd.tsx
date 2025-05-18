import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';

type BannerAdProps = {
  position: 'left' | 'right' | 'top';
  adContent?: {
    imageUrl: string;
    linkUrl: string;
    altText: string;
  };
};

export default function BannerAd({ position, adContent }: BannerAdProps) {
  // Only show ads on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const handlePress = () => {
    if (adContent?.linkUrl) {
      Linking.openURL(adContent.linkUrl);
    }
  };

  // Placeholder ad if no content provided
  const placeholderAd = {
    imageUrl:
      'https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    linkUrl: 'https://example.com',
    altText: 'Support pet adoption',
  };

  const ad = adContent || placeholderAd;

  // Different styles based on position
  const containerStyle = [
    styles.container,
    position === 'left' && styles.leftContainer,
    position === 'right' && styles.rightContainer,
    position === 'top' && styles.topContainer,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.adWrapper}>
        <TouchableOpacity style={styles.adContent} onPress={handlePress}>
          {/* <Image
            source={{ uri: ad.imageUrl }}
            style={styles.adImage}
            accessibilityLabel={ad.altText}
          /> */}
          <Text style={styles.sponsoredLabel}>Sponsored</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'none',
    ...Platform.select({
      web: {
        display: 'flex',
      },
    }),
  },
  leftContainer: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    // width: 160,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
    // width: 160,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContainer: {
    width: '100%',
    height: 90,
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  adContent: {
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
