import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Filter, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export type FilterOptions = {
  type: ('dog' | 'cat' | 'other')[];
  isFriendly: boolean | null;
  ageRange: [number | null, number | null]; // [min, max]
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

export default function PetFilter({ onFilterChange, initialFilters = defaultFilters }: PetFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetFilters = { ...defaultFilters };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  const toggleType = (type: 'dog' | 'cat' | 'other') => {
    setFilters(current => {
      const newTypes = [...current.type];
      const index = newTypes.indexOf(type);
      
      if (index >= 0) {
        newTypes.splice(index, 1);
      } else {
        newTypes.push(type);
      }
      
      return { ...current, type: newTypes };
    });
  };

  const toggleFriendly = () => {
    setFilters(current => {
      // Cycle through: null (any) -> true (friendly) -> false (not marked friendly) -> null (any)
      let newValue: boolean | null = true;
      if (current.isFriendly === true) newValue = false;
      if (current.isFriendly === false) newValue = null;
      return { ...current, isFriendly: newValue };
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleFilter} style={styles.filterButton}>
        <Filter size={24} color="#6366F1" />
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.filterModal}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Pets</Text>
            <TouchableOpacity onPress={toggleFilter}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Pet Type</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity 
                style={[
                  styles.chip,
                  filters.type.includes('dog') && styles.chipSelected
                ]}
                onPress={() => toggleType('dog')}
              >
                <Text 
                  style={[
                    styles.chipText, 
                    filters.type.includes('dog') && styles.chipTextSelected
                  ]}
                >
                  Dogs
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.chip,
                  filters.type.includes('cat') && styles.chipSelected
                ]}
                onPress={() => toggleType('cat')}
              >
                <Text 
                  style={[
                    styles.chipText, 
                    filters.type.includes('cat') && styles.chipTextSelected
                  ]}
                >
                  Cats
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.chip,
                  filters.type.includes('other') && styles.chipSelected
                ]}
                onPress={() => toggleType('other')}
              >
                <Text 
                  style={[
                    styles.chipText, 
                    filters.type.includes('other') && styles.chipTextSelected
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Temperament</Text>
            <TouchableOpacity 
              style={[
                styles.chipLarge,
                filters.isFriendly === true && styles.chipSelected,
                filters.isFriendly === false && styles.chipWarning
              ]}
              onPress={toggleFriendly}
            >
              <Text 
                style={[
                  styles.chipText, 
                  (filters.isFriendly === true || filters.isFriendly === false) && styles.chipTextSelected
                ]}
              >
                {filters.isFriendly === null && "Any"}
                {filters.isFriendly === true && "Friendly"}
                {filters.isFriendly === false && "Any (incl. not marked friendly)"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: 'relative',
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
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
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