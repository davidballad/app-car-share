import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';

interface VerificationStatus {
  phoneVerified: boolean;
  identityVerified: boolean;
  backgroundCheckPassed: boolean;
  driverLicenseVerified: boolean;
  vehicleRegistrationVerified: boolean;
  backgroundCheckExpiry?: string;
}

const VerificationStatusScreen: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>({
    phoneVerified: true,
    identityVerified: false,
    backgroundCheckPassed: false,
    driverLicenseVerified: false,
    vehicleRegistrationVerified: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch verification status from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (verified: boolean) => {
    return verified ? '✅' : '⏳';
  };

  const getStatusText = (verified: boolean) => {
    return verified ? 'Verificado' : 'Pendiente';
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? '#28a745' : '#ffc107';
  };

  const verificationItems = [
    {
      key: 'phoneVerified',
      title: 'Teléfono Verificado',
      description: 'Tu número de teléfono ha sido confirmado',
      verified: status.phoneVerified,
    },
    {
      key: 'identityVerified',
      title: 'Identidad Verificada',
      description: 'Documento de identidad confirmado',
      verified: status.identityVerified,
    },
    {
      key: 'backgroundCheckPassed',
      title: 'Antecedentes Penales',
      description: 'Verificación de antecedentes completada',
      verified: status.backgroundCheckPassed,
    },
    {
      key: 'driverLicenseVerified',
      title: 'Licencia de Conducir',
      description: 'Licencia de conducir verificada',
      verified: status.driverLicenseVerified,
    },
    {
      key: 'vehicleRegistrationVerified',
      title: 'Registro del Vehículo',
      description: 'Matrícula del vehículo verificada',
      verified: status.vehicleRegistrationVerified,
    },
  ];

  const completedVerifications = verificationItems.filter(item => item.verified).length;
  const totalVerifications = verificationItems.length;
  const completionPercentage = (completedVerifications / totalVerifications) * 100;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Estado de Verificación</Text>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progreso de Verificación</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedVerifications} de {totalVerifications} completadas ({Math.round(completionPercentage)}%)
          </Text>
        </View>

        <View style={styles.verificationList}>
          {verificationItems.map((item) => (
            <View key={item.key} style={styles.verificationItem}>
              <View style={styles.verificationIcon}>
                <Text style={styles.iconText}>
                  {getStatusIcon(item.verified)}
                </Text>
              </View>
              
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>{item.title}</Text>
                <Text style={styles.verificationDescription}>
                  {item.description}
                </Text>
              </View>
              
              <View style={styles.verificationStatus}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(item.verified) }
                ]}>
                  {getStatusText(item.verified)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {status.backgroundCheckExpiry && (
          <View style={styles.expiryCard}>
            <Text style={styles.expiryTitle}>Renovación Requerida</Text>
            <Text style={styles.expiryText}>
              Tu verificación de antecedentes expira el {status.backgroundCheckExpiry}.
              Renueva antes de esta fecha para seguir ofreciendo viajes.
            </Text>
            <TouchableOpacity style={styles.renewButton}>
              <Text style={styles.renewButtonText}>Renovar Ahora</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Subir Documentos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Verificar Antecedentes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.infoText}>
            Si tienes problemas con la verificación, contacta a nuestro equipo de soporte.
            La verificación completa es necesaria para ofrecer viajes como conductor.
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
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  verificationList: {
    marginBottom: 20,
  },
  verificationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666',
  },
  verificationStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expiryCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  expiryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  renewButton: {
    backgroundColor: '#ffc107',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  renewButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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

export default VerificationStatusScreen;