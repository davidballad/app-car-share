import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

type DocumentType = 'cedula' | 'passport';

const BackgroundCheckScreen: React.FC = () => {
  const [documentType, setDocumentType] = useState<DocumentType>('cedula');
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    documentNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCedula = (cedula: string): boolean => {
    if (cedula.length !== 10) return false;
    
    const digits = cedula.split('').map(Number);
    const province = parseInt(cedula.substring(0, 2));
    
    if (province < 1 || province > 24) return false;
    
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      let result = digits[i] * coefficients[i];
      if (result > 9) result -= 9;
      sum += result;
    }
    
    const checkDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    return checkDigit === digits[9];
  };

  const validateForm = (): boolean => {
    const { fullName, birthDate, documentNumber } = formData;

    if (!fullName || !birthDate || !documentNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }

    if (documentType === 'cedula') {
      if (!validateCedula(documentNumber)) {
        Alert.alert('Error', 'Número de cédula inválido');
        return false;
      }
    } else {
      if (documentNumber.length < 6) {
        Alert.alert('Error', 'Número de pasaporte inválido');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: API call to submit background check
      const response = await fetch('http://localhost:3000/api/verification/background-check/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token
        },
        body: JSON.stringify({
          documentType,
          documentNumber: formData.documentNumber,
          fullName: formData.fullName,
          birthDate: formData.birthDate,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Solicitud de verificación enviada correctamente');
      } else {
        Alert.alert('Error', data.error?.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verificación de Antecedentes</Text>
        <Text style={styles.subtitle}>
          Completa tu verificación para poder ofrecer viajes
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tipo de Documento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={documentType}
              onValueChange={(value) => setDocumentType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Cédula de Identidad" value="cedula" />
              <Picker.Item label="Pasaporte" value="passport" />
            </Picker>
          </View>

          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Nombre completo como aparece en el documento"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <TextInput
            style={styles.input}
            value={formData.birthDate}
            onChangeText={(value) => handleInputChange('birthDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            {documentType === 'cedula' ? 'Número de Cédula' : 'Número de Pasaporte'}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.documentNumber}
            onChangeText={(value) => handleInputChange('documentNumber', value)}
            placeholder={documentType === 'cedula' ? '1234567890' : 'AB1234567'}
            keyboardType={documentType === 'cedula' ? 'numeric' : 'default'}
            maxLength={documentType === 'cedula' ? 10 : 20}
            autoCapitalize="characters"
          />

          {documentType === 'cedula' && (
            <Text style={styles.helpText}>
              La cédula debe tener 10 dígitos y ser válida según el algoritmo ecuatoriano
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Por qué necesitamos esto?</Text>
          <Text style={styles.infoText}>
            La verificación de antecedentes es obligatoria para conductores en Ecuador
            y ayuda a mantener la seguridad de todos los usuarios.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: -15,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86AB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BackgroundCheckScreen;