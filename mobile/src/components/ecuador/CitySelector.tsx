import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import { ECUADOR_CITIES } from '../../utils/ecuadorUtils';
import { Card, Button } from '../common';

interface CitySelectorProps {
  value?: string;
  onSelect: (city: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onSelect,
  placeholder,
  label,
  error,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { t } = useLocalization();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = ECUADOR_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (cityName: string) => {
    onSelect(cityName);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const renderCityItem = ({ item }: { item: typeof ECUADOR_CITIES[0] }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item.name)}
    >
      <View>
        <Text style={[styles.cityName, { color: colors.text.primary }]}>
          {item.name}
        </Text>
        <Text style={[styles.provinceName, { color: colors.text.secondary }]}>
          {item.province}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.primary }]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background.primary,
            borderColor: error ? colors.status.error : colors.border.light,
            borderRadius: borderRadius.base,
          }
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[
          styles.selectorText,
          {
            color: value ? colors.text.primary : colors.text.tertiary,
            fontSize: typography.fontSize.base,
          }
        ]}>
          {value || placeholder || t('search.selectCity')}
        </Text>
        <Text style={[styles.arrow, { color: colors.text.secondary }]}>▼</Text>
      </TouchableOpacity>

      {error && (
        <Text style={[styles.error, { color: colors.status.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modal, { backgroundColor: colors.background.secondary }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.primary.blue }]}>
            <Text style={[styles.modalTitle, { color: colors.text.inverse }]}>
              {t('search.selectCity')}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: colors.text.inverse }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.light,
                  borderRadius: borderRadius.base,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                }
              ]}
              placeholder={t('common.search')}
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
            />
          </View>

          <FlatList
            data={filteredCities}
            renderItem={renderCityItem}
            keyExtractor={(item) => item.code}
            style={styles.cityList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  selectorText: {
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  cityList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cityItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  provinceName: {
    fontSize: 14,
  },
});

export default CitySelector;