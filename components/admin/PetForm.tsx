import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/components/pets/PetCard';
import { Camera, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import AppTextInput from '@/components/common/AppTextInput';
import i18n from '@/lib/i18n';
import { rtlFlip } from '../../utils/layout';

type PetFormProps = {
  pet?: Pet;
  onSubmit: (pet: Omit<Pet, 'id' | 'created_at'>) => Promise<void>;
  isLoading: boolean;
};

export default function PetForm({ pet, onSubmit, isLoading }: PetFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(pet?.name || '');
  const [age, setAge] = useState(pet?.age ? pet.age.toString() : '');
  const [ageUnit, setAgeUnit] = useState<'days' | 'months' | 'years'>(
    pet?.age_unit || 'months'
  );
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

    if (!result.canceled && result.assets?.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split('.').pop() || 'jpg';
      const filePath = `${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('pet-images')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      Alert.alert(
        t('form.uploadErrorTitle'),
        err.message || t('form.uploadErrorMsg')
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async () => {
    const parsedAge = parseInt(age, 10);

    if (!name || !age || !description || !contactPhone || !imageUrl) {
      Alert.alert(t('form.missingFieldsTitle'), t('form.missingFieldsMsg'));
      return;
    }

    if (isNaN(parsedAge)) {
      Alert.alert(t('form.invalidAgeTitle'), t('form.invalidAgeMsg'));
      return;
    }

    if (!/^\+?\d{7,15}$/.test(contactPhone)) {
      Alert.alert(t('form.invalidPhoneTitle'), t('form.invalidPhoneMsg'));
      return;
    }

    const formData = {
      name,
      age: parsedAge,
      age_unit: ageUnit,
      type,
      is_friendly: isFriendly,
      description,
      contact_phone: contactPhone,
      image_url: imageUrl,
    };

    try {
      await onSubmit(formData);
      Toast.show({
        type: 'success',
        text1: t('form.success'),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(t('form.submitErrorTitle'), t('form.submitErrorMsg'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.imageLabel')}</Text>
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
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handleImagePicker}
            >
              {uploadLoading ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <>
                  <Camera size={24} color="#6366F1" />
                  <Text style={styles.imagePickerText}>
                    {t('form.uploadImage')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.name')}</Text>
          <AppTextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('form.namePlaceholder')}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t('form.age')}</Text>
            <AppTextInput
              style={styles.input}
              value={age}
              onChangeText={(text: string) =>
                setAge(text.replace(/[^0-9]/g, ''))
              }
              keyboardType="numeric"
              placeholder={t('form.age')}
            />
          </View>
          <View
            style={[
              styles.formGroup,
              { flex: 1 },
              rtlFlip('marginLeft', 'marginRight', 8),
            ]}
          >
            <Text style={styles.label}>{t('form.ageUnit')}</Text>
            <View style={styles.buttonGroupContainer}>
              {(['days', 'months', 'years'] as const).map((unit) => (
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
                    {t(`form.units.${unit}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.type')}</Text>
          <View style={styles.buttonGroupContainer}>
            {(['dog', 'cat', 'other'] as const).map((petType) => (
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
                  {t(`form.types.${petType}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t('form.isFriendly')}</Text>
            <Switch
              value={isFriendly}
              onValueChange={setIsFriendly}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.description')}</Text>
          <AppTextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('form.descriptionPlaceholder')}
            multiline
            numberOfLines={Platform.OS === 'ios' ? 0 : 4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.phone')}</Text>
          <AppTextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder={t('form.phonePlaceholder')}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || uploadLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isLoading || uploadLoading}
        >
          {isLoading || uploadLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {pet ? t('form.update') : t('form.submit')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 500,
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
