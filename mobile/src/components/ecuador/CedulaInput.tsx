import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalization } from '../../hooks/useLocalization';
import { validateCedula, formatCedula } from '../../utils/ecuadorUtils';
import { Input } from '../common';

interface CedulaInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

const CedulaInput: React.FC<CedulaInputProps> = ({
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
    // Format the cedula as user types
    const formatted = formatCedula(value);
    setFormattedValue(formatted);

    // Validate cedula
    if (showValidation && value && value.length === 10) {
      if (!validateCedula(value)) {
        setValidationError(t('errors.invalidCedula'));
      } else {
        setValidationError('');
      }
    } else if (showValidation && value && value.length > 0 && value.length < 10) {
      setValidationError('La cédula debe tener 10 dígitos');
    } else {
      setValidationError('');
    }
  }, [value, showValidation, t]);

  const handleTextChange = (text: string) => {
    // Remove formatting and only keep digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    onChangeText(limited);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return '1234567890';
  };

  const getHelperText = () => {
    if (error || validationError) return null;
    
    return (
      <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
        {t('verification.cedulaFormat')}
      </Text>
    );
  };

  const getValidationIcon = () => {
    if (!showValidation || !value || value.length < 10) return null;
    
    const isValid = validateCedula(value);
    return (
      <View style={styles.validationIcon}>
        <Text style={{ color: isValid ? colors.status.success : colors.status.error }}>
          {isValid ? '✓' : '✗'}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <Input
        label={label || t('verification.cedula')}
        placeholder={getPlaceholder()}
        value={formattedValue}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        error={error || validationError}
        disabled={disabled}
        rightIcon={getValidationIcon()}
        maxLength={12} // Formatted length: XX-XXXX-XXXX
      />
      {getHelperText()}
    </View>
  );
};

const styles = StyleSheet.create({
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  validationIcon: {
    paddingLeft: 8,
  },
});

export default CedulaInput;