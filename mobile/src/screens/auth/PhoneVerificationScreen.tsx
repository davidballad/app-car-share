import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type PhoneVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'PhoneVerification'
>;
type PhoneVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'PhoneVerification'
>;

interface Props {
  navigation: PhoneVerificationScreenNavigationProp;
  route: PhoneVerificationScreenRouteProp;
}

const PhoneVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone } = route.params;

  const handleVerification = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Teléfono verificado correctamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Error', data.error?.message || 'Código incorrecto');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Éxito', 'Código reenviado');
      } else {
        Alert.alert('Error', 'No se pudo reenviar el código');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al reenviar el código');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verificar Teléfono</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un código de verificación al número:
        </Text>
        <Text style={styles.phone}>{phone}</Text>

        <TextInput
          style={styles.input}
          placeholder="Código de 6 dígitos"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerification}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : 'Verificar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleResendCode}
        >
          <Text style={styles.linkText}>
            ¿No recibiste el código? Reenviar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    marginBottom: 20,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#2E86AB',
    fontSize: 14,
  },
});

export default PhoneVerificationScreen;