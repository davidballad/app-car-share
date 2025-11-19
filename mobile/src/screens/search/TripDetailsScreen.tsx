import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';

interface TripDetails {
  id: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  description?: string;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    totalTrips: number;
    phone: string;
    verificationStatus: {
      phoneVerified: boolean;
      identityVerified: boolean;
      backgroundCheckPassed: boolean;
      driverLicenseVerified: boolean;
    };
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
}

const TripDetailsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);

  // Mock data - in real app this would come from navigation params or API
  const trip: TripDetails = {
    id: '1',
    originCity: 'Quito',
    destinationCity: 'Guayaquil',
    departureDate: '2024-12-01',
    departureTime: '08:00',
    estimatedArrivalTime: '16:00',
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 25,
    description: 'Viaje cómodo y seguro. Salida puntual desde el Terminal Terrestre de Quito.',
    driver: {
      id: 'driver1',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      rating: 4.8,
      totalTrips: 45,
      phone: '0987654321',
      verificationStatus: {
        phoneVerified: true,
        identityVerified: true,
        backgroundCheckPassed: true,
        driverLicenseVerified: true,
      },
    },
    vehicleInfo: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Blanco',
      licensePlate: 'ABC-1234',
    },
  };

  const handleBookTrip = async () => {
    if (selectedSeats > trip.availableSeats) {
      Alert.alert('Error', 'No hay suficientes asientos disponibles');
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to book trip
      Alert.alert(
        'Confirmar Reserva',
        `¿Deseas reservar ${selectedSeats} asiento${selectedSeats > 1 ? 's' : ''} por $${selectedSeats * trip.pricePerSeat}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: confirmBooking },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = () => {
    Alert.alert('Éxito', 'Reserva confirmada. El conductor será notificado.');
  };

  const handleContactDriver = () => {
    const whatsappUrl = `https://wa.me/593${trip.driver.phone.substring(1)}?text=Hola! Estoy interesado en tu viaje ${trip.originCity} → ${trip.destinationCity} el ${new Date(trip.departureDate).toLocaleDateString('es-EC')}`;
    Linking.openURL(whatsappUrl);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  const getVerificationBadges = () => {
    const badges = [];
    if (trip.driver.verificationStatus.phoneVerified) badges.push('📱');
    if (trip.driver.verificationStatus.identityVerified) badges.push('🆔');
    if (trip.driver.verificationStatus.backgroundCheckPassed) badges.push('✅');
    if (trip.driver.verificationStatus.driverLicenseVerified) badges.push('🚗');
    return badges.join(' ');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trip Header */}
        <View style={styles.tripHeader}>
          <Text style={styles.route}>
            {trip.originCity} → {trip.destinationCity}
          </Text>
          <Text style={styles.date}>
            {new Date(trip.departureDate).toLocaleDateString('es-EC', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Time and Price Info */}
        <View style={styles.timeCard}>
          <View style={styles.timeInfo}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Salida</Text>
              <Text style={styles.time}>{trip.departureTime}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Llegada</Text>
              <Text style={styles.time}>{trip.estimatedArrivalTime}</Text>
            </View>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.price}>${trip.pricePerSeat}</Text>
            <Text style={styles.priceLabel}>por persona</Text>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>Conductor</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>
                {trip.driver.firstName.charAt(0)}
              </Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>
                {trip.driver.firstName} {trip.driver.lastName}
              </Text>
              <Text style={styles.driverRating}>
                {renderStars(trip.driver.rating)} {trip.driver.rating} • {trip.driver.totalTrips} viajes
              </Text>
              <Text style={styles.verificationBadges}>
                {getVerificationBadges()} Verificado
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactDriver}
            >
              <Text style={styles.contactButtonText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          <Text style={styles.vehicleInfo}>
            {trip.vehicleInfo.make} {trip.vehicleInfo.model} {trip.vehicleInfo.year}
          </Text>
          <Text style={styles.vehicleDetails}>
            Color: {trip.vehicleInfo.color} • Placa: {trip.vehicleInfo.licensePlate}
          </Text>
        </View>

        {/* Trip Description */}
        {trip.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{trip.description}</Text>
          </View>
        )}

        {/* Seat Selection */}
        <View style={styles.seatCard}>
          <Text style={styles.sectionTitle}>Seleccionar Asientos</Text>
          <Text style={styles.availableSeats}>
            {trip.availableSeats} de {trip.totalSeats} asientos disponibles
          </Text>
          <View style={styles.seatSelector}>
            {[1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.seatButton,
                  selectedSeats === num && styles.seatButtonSelected,
                  num > trip.availableSeats && styles.seatButtonDisabled,
                ]}
                onPress={() => setSelectedSeats(num)}
                disabled={num > trip.availableSeats}
              >
                <Text style={[
                  styles.seatButtonText,
                  selectedSeats === num && styles.seatButtonTextSelected,
                  num > trip.availableSeats && styles.seatButtonTextDisabled,
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Asientos seleccionados:</Text>
            <Text style={styles.summaryValue}>{selectedSeats}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio por asiento:</Text>
            <Text style={styles.summaryValue}>${trip.pricePerSeat}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${selectedSeats * trip.pricePerSeat}</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBookTrip}
          disabled={loading}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Procesando...' : 'Reservar Viaje'}
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
    padding: 16,
  },
  tripHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  route: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  priceSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E86AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  verificationBadges: {
    fontSize: 12,
    color: '#28a745',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 20,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  vehicleInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  seatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  availableSeats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  seatSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatButtonSelected: {
    backgroundColor: '#2E86AB',
    borderColor: '#2E86AB',
  },
  seatButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  seatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  seatButtonTextSelected: {
    color: '#fff',
  },
  seatButtonTextDisabled: {
    color: '#ccc',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  bookButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TripDetailsScreen;