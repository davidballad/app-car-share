import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import { validateEcuadorPhone, formatEcuadorPhone } from '../../utils/ecuadorUtils';
import { Input } from '../common';

interface EcuadorPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

const EcuadorPhoneInput: React.FC<EcuadorPhoneInputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  disabled = false,
  showValidation = true,
}) => {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const [formattedValue, setFormattedValue] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Format the phone number as user types
    const formatted = formatEcuadorPhone(value);
    setFormattedValue(formatted);

    // Validate phone number
    if (showValidation && value && !validateEcuadorPhone(value)) {
      setValidationError(t('errors.invalidPhone'));
    } else {
      setValidationError('');
    }
  }, [value, showValidation, t]);

  const handleTextChange = (text: string) => {
    // Remove formatting and only keep digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits for mobile or 9 for landline
    const limited = cleaned.substring(0, 10);
    
    onChangeText(limited);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return '0987654321'; // Example Ecuador mobile number
  };

  const getHelperText = () => {
    if (error || validationError) return null;
    
    return (
      <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
        Formato: 09XX-XXX-XXX (móvil) o 0X-XXX-XXXX (fijo)
      </Text>
    );
  };

  return (
    <View>
      <Input
        label={label || t('auth.phone')}
        placeholder={getPlaceholder()}
        value={formattedValue}
        onChangeText={handleTextChange}
        keyboardType="phone-pad"
        error={error || validationError}
        disabled={disabled}
        leftIcon={
          <View style={styles.countryCode}>
            <Text style={[styles.countryCodeText, { color: colors.text.secondary }]}>
              🇪🇨 +593
            </Text>
          </View>
        }
      />
      {getHelperText()}
    </View>
  );
};

const styles = StyleSheet.create({
  countryCode: {
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EcuadorPhoneInput;