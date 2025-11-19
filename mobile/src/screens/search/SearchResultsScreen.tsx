import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';

interface Trip {
  id: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  pricePerSeat: number;
  driver: {
    firstName: string;
    lastName: string;
    rating: number;
    profilePhoto?: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    color: string;
  };
}

const SearchResultsScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockTrips: Trip[] = [
        {
          id: '1',
          originCity: 'Quito',
          destinationCity: 'Guayaquil',
          departureDate: '2024-12-01',
          departureTime: '08:00',
          estimatedArrivalTime: '16:00',
          availableSeats: 3,
          pricePerSeat: 25,
          driver: {
            firstName: 'Carlos',
            lastName: 'Mendoza',
            rating: 4.8,
          },
          vehicleInfo: {
            make: 'Toyota',
            model: 'Corolla',
            color: 'Blanco',
          },
        },
        {
          id: '2',
          originCity: 'Quito',
          destinationCity: 'Guayaquil',
          departureDate: '2024-12-01',
          departureTime: '14:00',
          estimatedArrivalTime: '22:00',
          availableSeats: 2,
          pricePerSeat: 30,
          driver: {
            firstName: 'María',
            lastName: 'González',
            rating: 4.9,
          },
          vehicleInfo: {
            make: 'Chevrolet',
            model: 'Aveo',
            color: 'Azul',
          },
        },
      ];
      setTrips(mockTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const handleTripPress = (trip: Trip) => {
    // TODO: Navigate to trip details
    console.log('Trip selected:', trip.id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  if (loading && trips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Buscando viajes...</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noResultsTitle}>No se encontraron viajes</Text>
        <Text style={styles.noResultsText}>
          Intenta cambiar tus criterios de búsqueda o busca en fechas diferentes
        </Text>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Nueva Búsqueda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.resultsCount}>
          {trips.length} viaje{trips.length !== 1 ? 's' : ''} encontrado{trips.length !== 1 ? 's' : ''}
        </Text>

        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={styles.tripCard}
            onPress={() => handleTripPress(trip)}
          >
            <View style={styles.tripHeader}>
              <View style={styles.routeInfo}>
                <Text style={styles.route}>
                  {trip.originCity} → {trip.destinationCity}
                </Text>
                <Text style={styles.date}>
                  {new Date(trip.departureDate).toLocaleDateString('es-EC')}
                </Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>${trip.pricePerSeat}</Text>
                <Text style={styles.priceLabel}>por persona</Text>
              </View>
            </View>

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

            <View style={styles.tripFooter}>
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
                    {renderStars(trip.driver.rating)} {trip.driver.rating}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDetails}>
                <Text style={styles.vehicleInfo}>
                  {trip.vehicleInfo.make} {trip.vehicleInfo.model}
                </Text>
                <Text style={styles.seatsInfo}>
                  {trip.availableSeats} asiento{trip.availableSeats !== 1 ? 's' : ''} disponible{trip.availableSeats !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  route: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E86AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  driverRating: {
    fontSize: 12,
    color: '#666',
  },
  tripDetails: {
    alignItems: 'flex-end',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  seatsInfo: {
    fontSize: 12,
    color: '#666',
  },
});

export default SearchResultsScreen;