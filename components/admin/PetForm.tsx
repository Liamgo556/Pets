import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/components/pets/PetCard';
import { Camera, Upload, X } from 'lucide-react-native';

type PetFormProps = {
  pet?: Pet;
  onSubmit: (pet: Omit<Pet, 'id' | 'created_at'>) => Promise<void>;
  isLoading: boolean;
};

export default function PetForm({ pet, onSubmit, isLoading }: PetFormProps) {
  const [name, setName] = useState(pet?.name || '');
  const [age, setAge] = useState(pet?.age.toString() || '');
  const [ageUnit, setAgeUnit] = useState<'days' | 'months' | 'years'>(pet?.age_unit || 'months');
  const [type, setType] = useState<'dog' | 'cat' | 'other'>(pet?.type || 'dog');
  const [isFriendly, setIsFriendly] = useState(pet?.is_friendly || false);
  const [description, setDescription] = useState(pet?.description || '');
  const [contactPhone, setContactPhone] = useState(pet?.contact_phone || '');
  const [imageUrl, setImageUrl] = useState(pet?.image_url || '');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };
  
  const uploadImage = async (uri: string) => {
    try {
      setUploadLoading(true);
      
      // For web compatibility
      const formData = new FormData();
      const filename = uri.split('/').pop() || '';
      const fileType = filename.split('.').pop() || '';
      
      const file = {
        uri,
        name: filename,
        type: `image/${fileType}`,
      } as any;
      
      formData.append('file', file);
      
      // Get file extension
      const fileExt = uri.split('.').pop();
      // Generate unique filename
      const filePath = `${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('pet-images')
        .upload(filePath, formData);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);
      
      setImageUrl(urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!name || !age || !description || !contactPhone || !imageUrl) {
      alert('Please fill all required fields');
      return;
    }
    
    const formData = {
      name,
      age: parseInt(age, 10),
      age_unit: ageUnit,
      type,
      is_friendly: isFriendly,
      description,
      contact_phone: contactPhone,
      image_url: imageUrl,
    };
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pet Image (Required)</Text>
        
        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUrl('')}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
            {uploadLoading ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <>
                <Camera size={24} color="#6366F1" />
                <Text style={styles.imagePickerText}>Upload Image</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name (Required)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Pet's name"
        />
      </View>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Age (Required)</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={text => setAge(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="Age"
          />
        </View>
        
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Age Unit</Text>
          <View style={styles.buttonGroupContainer}>
            {(['days', 'months', 'years'] as const).map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.buttonGroupItem,
                  ageUnit === unit && styles.buttonGroupItemActive,
                ]}
                onPress={() => setAgeUnit(unit)}
              >
                <Text
                  style={[
                    styles.buttonGroupText,
                    ageUnit === unit && styles.buttonGroupTextActive,
                  ]}
                >
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Pet Type</Text>
        <View style={styles.buttonGroupContainer}>
          {(['dog', 'cat', 'other'] as const).map(petType => (
            <TouchableOpacity
              key={petType}
              style={[
                styles.buttonGroupItem,
                type === petType && styles.buttonGroupItemActive,
              ]}
              onPress={() => setType(petType)}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  type === petType && styles.buttonGroupTextActive,
                ]}
              >
                {petType.charAt(0).toUpperCase() + petType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Is Friendly</Text>
          <Switch
            value={isFriendly}
            onValueChange={setIsFriendly}
            trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (Required)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the pet..."
          multiline
          numberOfLines={Platform.OS === 'ios' ? 0 : 4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Phone (Required)</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>
            {pet ? 'Update Pet' : 'Add Pet'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonGroupContainer: {
    flexDirection: 'row',
  },
  buttonGroupItem: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  buttonGroupItemActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  buttonGroupText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  buttonGroupTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePicker: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#6366F1',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});