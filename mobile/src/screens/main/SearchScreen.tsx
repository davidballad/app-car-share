import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ECUADOR_CITIES = [
  'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán',
  'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Esmeraldas', 'Quevedo',
  'Riobamba', 'Milagro', 'Ibarra', 'La Libertad', 'Babahoyo'
];

const SearchScreen: React.FC = () => {
  const [searchData, setSearchData] = useState({
    originCity: '',
    destinationCity: '',
    departureDate: '',
    passengers: '1',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    const { originCity, destinationCity, departureDate } = searchData;

    if (!originCity || !destinationCity || !departureDate) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (originCity === destinationCity) {
      Alert.alert('Error', 'La ciudad de origen y destino deben ser diferentes');
      return;
    }

    setLoading(true);
    try {
      // TODO: Navigate to search results
      Alert.alert('Búsqueda', `Buscando viajes de ${originCity} a ${destinationCity}`);
    } catch (error) {
      Alert.alert('Error', 'Error al buscar viajes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Buscar Viajes</Text>
        <Text style={styles.subtitle}>Encuentra tu viaje ideal</Text>

        <View style={styles.searchForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciudad de Origen</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchData.originCity}
                onValueChange={(value) => handleInputChange('originCity', value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona ciudad de origen" value="" />
                {ECUADOR_CITIES.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciudad de Destino</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchData.destinationCity}
                onValueChange={(value) => handleInputChange('destinationCity', value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona ciudad de destino" value="" />
                {ECUADOR_CITIES.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Viaje</Text>
            <TextInput
              style={styles.input}
              value={searchData.departureDate}
              onChangeText={(value) => handleInputChange('departureDate', value)}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Pasajeros</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchData.passengers}
                onValueChange={(value) => handleInputChange('passengers', value)}
                style={styles.picker}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Picker.Item key={num} label={`${num} pasajero${num > 1 ? 's' : ''}`} value={num.toString()} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, loading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Buscando...' : 'Buscar Viajes'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularRoutes}>
          <Text style={styles.sectionTitle}>Rutas Populares</Text>
          <View style={styles.routesList}>
            <TouchableOpacity style={styles.routeItem}>
              <Text style={styles.routeText}>Quito → Guayaquil</Text>
              <Text style={styles.routePrice}>Desde $25</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.routeItem}>
              <Text style={styles.routeText}>Cuenca → Quito</Text>
              <Text style={styles.routePrice}>Desde $30</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.routeItem}>
              <Text style={styles.routeText}>Guayaquil → Manta</Text>
              <Text style={styles.routePrice}>Desde $20</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 28,
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
  searchForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  popularRoutes: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  routesList: {
    gap: 12,
  },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  routePrice: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: 'bold',
  },
});

export default SearchScreen;