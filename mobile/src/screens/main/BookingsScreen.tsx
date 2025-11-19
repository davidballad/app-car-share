import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';

interface Booking {
  id: string;
  tripId: string;
  seatsBooked: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  trip: {
    originCity: string;
    destinationCity: string;
    departureDate: string;
    departureTime: string;
    driverId: string;
  };
  driver: {
    firstName: string;
    lastName: string;
    phone: string;
    rating: number;
  };
}

const BookingsScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: '1',
          tripId: 'trip1',
          seatsBooked: 2,
          totalAmount: 50,
          paymentMethod: 'cash',
          status: 'confirmed',
          bookingDate: '2024-11-20',
          trip: {
            originCity: 'Quito',
            destinationCity: 'Guayaquil',
            departureDate: '2024-12-01',
            departureTime: '08:00',
            driverId: 'driver1',
          },
          driver: {
            firstName: 'Carlos',
            lastName: 'Mendoza',
            phone: '0987654321',
            rating: 4.8,
          },
        },
        {
          id: '2',
          tripId: 'trip2',
          seatsBooked: 1,
          totalAmount: 30,
          paymentMethod: 'bank_transfer',
          status: 'completed',
          bookingDate: '2024-10-15',
          trip: {
            originCity: 'Cuenca',
            destinationCity: 'Quito',
            departureDate: '2024-10-20',
            departureTime: '14:00',
            driverId: 'driver2',
          },
          driver: {
            firstName: 'María',
            lastName: 'González',
            phone: '0976543210',
            rating: 4.9,
          },
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', onPress: () => confirmCancelBooking(bookingId) },
      ]
    );
  };

  const confirmCancelBooking = async (bookingId: string) => {
    try {
      // TODO: API call to cancel booking
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const }
            : booking
        )
      );
      Alert.alert('Éxito', 'Reserva cancelada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la reserva');
    }
  };

  const handleContactDriver = (phone: string, trip: any) => {
    const whatsappUrl = `https://wa.me/593${phone.substring(1)}?text=Hola! Te contacto por el viaje ${trip.originCity} → ${trip.destinationCity} el ${new Date(trip.departureDate).toLocaleDateString('es-EC')}`;
    Linking.openURL(whatsappUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#6c757d';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    return method === 'cash' ? 'Efectivo' : 'Transferencia';
  };

  const filteredBookings = bookings.filter(booking => {
    const tripDate = new Date(booking.trip.departureDate);
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return tripDate >= now && booking.status === 'confirmed';
    } else {
      return tripDate < now || booking.status !== 'confirmed';
    }
  });

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No tienes viajes próximos' : 'No hay historial'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? 'Busca y reserva tu próximo viaje' 
                : 'Tus viajes pasados aparecerán aquí'
              }
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.route}>
                    {booking.trip.originCity} → {booking.trip.destinationCity}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(booking.trip.departureDate).toLocaleDateString('es-EC')} • {booking.trip.departureTime}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Conductor:</Text>
                  <Text style={styles.detailValue}>
                    {booking.driver.firstName} {booking.driver.lastName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Asientos:</Text>
                  <Text style={styles.detailValue}>{booking.seatsBooked}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>${booking.totalAmount}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pago:</Text>
                  <Text style={styles.detailValue}>
                    {getPaymentMethodText(booking.paymentMethod)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactDriver(booking.driver.phone, booking.trip)}
                >
                  <Text style={styles.contactButtonText}>💬 Contactar</Text>
                </TouchableOpacity>

                {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking.id)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2E86AB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bookingCard: {
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
  bookingHeader: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BookingsScreen;