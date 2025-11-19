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

const VEHICLE_TYPES = [
  { label: 'Sedán', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Hatchback', value: 'hatchback' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Van', value: 'van' },
  { label: 'Otro', value: 'other' },
];

const CreateTripScreen: React.FC = () => {
  const [tripData, setTripData] = useState({
    originCity: '',
    destinationCity: '',
    departureDate: '',
    departureTime: '',
    estimatedArrivalTime: '',
    availableSeats: '4',
    pricePerSeat: '',
    description: '',
  });

  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vehicleType: 'sedan',
  });

  const [loading, setLoading] = useState(false);

  const handleTripInputChange = (field: string, value: string) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleInputChange = (field: string, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { originCity, destinationCity, departureDate, departureTime, estimatedArrivalTime, pricePerSeat } = tripData;
    const { make, model, year, color, licensePlate } = vehicleData;

    if (!originCity || !destinationCity || !departureDate || !departureTime || !estimatedArrivalTime || !pricePerSeat) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (originCity === destinationCity) {
      Alert.alert('Error', 'La ciudad de origen y destino deben ser diferentes');
      return false;
    }

    if (!make || !model || !year || !color || !licensePlate) {
      Alert.alert('Error', 'Por favor completa toda la información del vehículo');
      return false;
    }

    const price = parseFloat(pricePerSeat);
    if (isNaN(price) || price <= 0 || price > 1000) {
      Alert.alert('Error', 'El precio debe ser entre $0.01 y $1000');
      return false;
    }

    // Validate Ecuador license plate format
    const plateRegex = /^[A-Z]{2,3}-\d{4}$/;
    if (!plateRegex.test(licensePlate.toUpperCase())) {
      Alert.alert('Error', 'Formato de placa inválido. Usa ABC-1234 o AB-1234');
      return false;
    }

    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const tripPayload = {
        ...tripData,
        pricePerSeat: parseFloat(tripData.pricePerSeat),
        availableSeats: parseInt(tripData.availableSeats),
        vehicleInfo: {
          ...vehicleData,
          year: parseInt(vehicleData.year),
          licensePlate: vehicleData.licensePlate.toUpperCase(),
        },
      };

      console.log('Creating trip:', tripPayload);
      Alert.alert('Éxito', 'Viaje creado correctamente');
      
      // TODO: Navigate back or to trip details
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Nuevo Viaje</Text>

        {/* Trip Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>

          <Text style={styles.label}>Ciudad de Origen *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tripData.originCity}
              onValueChange={(value) => handleTripInputChange('originCity', value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona ciudad de origen" value="" />
              {ECUADOR_CITIES.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Ciudad de Destino *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tripData.destinationCity}
              onValueChange={(value) => handleTripInputChange('destinationCity', value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona ciudad de destino" value="" />
              {ECUADOR_CITIES.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Fecha de Salida *</Text>
          <TextInput
            style={styles.input}
            value={tripData.departureDate}
            onChangeText={(value) => handleTripInputChange('departureDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Hora de Salida *</Text>
              <TextInput
                style={styles.input}
                value={tripData.departureTime}
                onChangeText={(value) => handleTripInputChange('departureTime', value)}
                placeholder="HH:MM"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Hora de Llegada *</Text>
              <TextInput
                style={styles.input}
                value={tripData.estimatedArrivalTime}
                onChangeText={(value) => handleTripInputChange('estimatedArrivalTime', value)}
                placeholder="HH:MM"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Asientos Disponibles</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tripData.availableSeats}
                  onValueChange={(value) => handleTripInputChange('availableSeats', value)}
                  style={styles.picker}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Precio por Asiento *</Text>
              <TextInput
                style={styles.input}
                value={tripData.pricePerSeat}
                onChangeText={(value) => handleTripInputChange('pricePerSeat', value)}
                placeholder="25.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Descripción (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={tripData.description}
            onChangeText={(value) => handleTripInputChange('description', value)}
            placeholder="Información adicional sobre el viaje..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Marca *</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.make}
                onChangeText={(value) => handleVehicleInputChange('make', value)}
                placeholder="Toyota"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.model}
                onChangeText={(value) => handleVehicleInputChange('model', value)}
                placeholder="Corolla"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.year}
                onChangeText={(value) => handleVehicleInputChange('year', value)}
                placeholder="2020"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Color *</Text>
              <TextInput
                style={styles.input}
                value={vehicleData.color}
                onChangeText={(value) => handleVehicleInputChange('color', value)}
                placeholder="Blanco"
              />
            </View>
          </View>

          <Text style={styles.label}>Placa *</Text>
          <TextInput
            style={styles.input}
            value={vehicleData.licensePlate}
            onChangeText={(value) => handleVehicleInputChange('licensePlate', value)}
            placeholder="ABC-1234"
            autoCapitalize="characters"
            maxLength={8}
          />

          <Text style={styles.label}>Tipo de Vehículo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={vehicleData.vehicleType}
              onValueChange={(value) => handleVehicleInputChange('vehicleType', value)}
              style={styles.picker}
            >
              {VEHICLE_TYPES.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateTrip}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creando...' : 'Crear Viaje'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  createButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateTripScreen;