import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';

interface Trip {
  id: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  bookedSeats: number;
  totalEarnings: number;
}

const TripsScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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
          availableSeats: 2,
          totalSeats: 4,
          pricePerSeat: 25,
          status: 'active',
          bookedSeats: 2,
          totalEarnings: 50,
        },
        {
          id: '2',
          originCity: 'Cuenca',
          destinationCity: 'Quito',
          departureDate: '2024-11-15',
          departureTime: '14:00',
          availableSeats: 0,
          totalSeats: 4,
          pricePerSeat: 30,
          status: 'completed',
          bookedSeats: 4,
          totalEarnings: 120,
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

  const handleCreateTrip = () => {
    // TODO: Navigate to create trip screen
    Alert.alert('Crear Viaje', 'Funcionalidad próximamente disponible');
  };

  const handleEditTrip = (tripId: string) => {
    // TODO: Navigate to edit trip screen
    Alert.alert('Editar Viaje', `Editando viaje ${tripId}`);
  };

  const handleCancelTrip = (tripId: string) => {
    Alert.alert(
      'Cancelar Viaje',
      '¿Estás seguro de que deseas cancelar este viaje?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', onPress: () => confirmCancelTrip(tripId) },
      ]
    );
  };

  const confirmCancelTrip = async (tripId: string) => {
    try {
      // TODO: API call to cancel trip
      setTrips(prev => 
        prev.map(trip => 
          trip.id === tripId 
            ? { ...trip, status: 'cancelled' as const }
            : trip
        )
      );
      Alert.alert('Éxito', 'Viaje cancelado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar el viaje');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'full': return '#ffc107';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'full': return 'Completo';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'active') {
      return trip.status === 'active' || trip.status === 'full';
    } else {
      return trip.status === 'completed' || trip.status === 'cancelled';
    }
  });

  if (loading && trips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Cargando viajes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTrip}>
          <Text style={styles.createButtonText}>+ Crear Viaje</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Activos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
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
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No tienes viajes activos' : 'No hay historial'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' 
                ? 'Crea tu primer viaje para empezar' 
                : 'Tus viajes completados aparecerán aquí'
              }
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity style={styles.emptyButton} onPress={handleCreateTrip}>
                <Text style={styles.emptyButtonText}>Crear Viaje</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredTrips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.route}>
                    {trip.originCity} → {trip.destinationCity}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(trip.departureDate).toLocaleDateString('es-EC')} • {trip.departureTime}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(trip.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{trip.bookedSeats}/{trip.totalSeats}</Text>
                  <Text style={styles.statLabel}>Asientos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${trip.pricePerSeat}</Text>
                  <Text style={styles.statLabel}>Por asiento</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${trip.totalEarnings}</Text>
                  <Text style={styles.statLabel}>Ganancia</Text>
                </View>
              </View>

              {trip.status === 'active' && (
                <View style={styles.tripActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditTrip(trip.id)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelTrip(trip.id)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default TripsScreen;
c
onst styles = StyleSheet.create({
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  createButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
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