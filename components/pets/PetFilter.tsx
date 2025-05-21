import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Filter, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export type FilterOptions = {
  type: ('dog' | 'cat' | 'other')[];
  isFriendly: boolean | null;
  ageRange: [number | null, number | null];
};

type PetFilterProps = {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
};

const defaultFilters: FilterOptions = {
  type: [],
  isFriendly: null,
  ageRange: [null, null],
};

export default function PetFilter({
  onFilterChange,
  initialFilters = defaultFilters,
}: PetFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const toggleFilter = () => setIsOpen(!isOpen);

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setIsOpen(false);
  };

  const toggleType = (type: 'dog' | 'cat' | 'other') => {
    setFilters((current) => {
      const types = [...current.type];
      const index = types.indexOf(type);
      if (index >= 0) types.splice(index, 1);
      else types.push(type);
      return { ...current, type: types };
    });
  };

  const toggleFriendly = () => {
    setFilters((current) => {
      let next: boolean | null = true;
      if (current.isFriendly === true) next = false;
      else if (current.isFriendly === false) next = null;
      return { ...current, isFriendly: next };
    });
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onPress={toggleFilter}
          style={({ hovered }) => [
            styles.filterButton,
            Platform.OS === 'web' && { cursor: 'pointer' },
            hovered && { opacity: 0.9 },
          ]}
        >
          <Filter size={24} color="#6366F1" />
          <Text
            style={[
              styles.filterText,
              isRTL && { marginRight: 8, marginLeft: 0 },
            ]}
          >
            {t('filter.button')}
          </Text>
        </Pressable>
      </View>

      {isOpen && (
        <View style={styles.overlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.filterModal, isRTL && { direction: 'rtl' }]}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>{t('filter.title')}</Text>
              <TouchableOpacity onPress={toggleFilter}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filter.type')}</Text>
              <View style={styles.chipContainer}>
                {(['dog', 'cat', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      filters.type.includes(type) && styles.chipSelected,
                    ]}
                    onPress={() => toggleType(type)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        filters.type.includes(type) && styles.chipTextSelected,
                      ]}
                    >
                      {t(`filter.types.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>{t('filter.temperament')}</Text>
              <TouchableOpacity
                style={[
                  styles.chipLarge,
                  filters.isFriendly === true && styles.chipSelected,
                  filters.isFriendly === false && styles.chipWarning,
                ]}
                onPress={toggleFriendly}
              >
                <Text
                  style={[
                    styles.chipText,
                    filters.isFriendly !== null && styles.chipTextSelected,
                  ]}
                >
                  {filters.isFriendly === null &&
                    t('filter.temperamentValues.any')}
                  {filters.isFriendly === true &&
                    t('filter.temperamentValues.friendly')}
                  {filters.isFriendly === false &&
                    t('filter.temperamentValues.notFriendly')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>{t('filter.reset')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>{t('filter.apply')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
    ...Platform.select({
      web: {
        width: 400,
        maxWidth: '100%',
      },
    }),
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  chipLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#6366F1',
  },
  chipWarning: {
    backgroundColor: '#F97316',
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
