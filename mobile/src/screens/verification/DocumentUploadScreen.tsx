import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';

interface Document {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  uri?: string;
}

const DocumentUploadScreen: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: 'license', name: 'Licencia de Conducir', required: true, uploaded: false },
    { id: 'registration', name: 'Matrícula del Vehículo', required: true, uploaded: false },
    { id: 'insurance', name: 'SOAT (Seguro)', required: true, uploaded: false },
    { id: 'identity', name: 'Cédula de Identidad', required: true, uploaded: false },
  ]);

  const handleDocumentUpload = (documentId: string) => {
    // TODO: Implement image picker and upload
    Alert.alert(
      'Subir Documento',
      'Selecciona una opción',
      [
        { text: 'Cámara', onPress: () => takePhoto(documentId) },
        { text: 'Galería', onPress: () => pickFromGallery(documentId) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const takePhoto = (documentId: string) => {
    // TODO: Implement camera functionality
    console.log('Taking photo for:', documentId);
    // Simulate upload
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploaded: true, uri: 'https://via.placeholder.com/200' }
          : doc
      )
    );
  };

  const pickFromGallery = (documentId: string) => {
    // TODO: Implement gallery picker
    console.log('Picking from gallery for:', documentId);
    // Simulate upload
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, uploaded: true, uri: 'https://via.placeholder.com/200' }
          : doc
      )
    );
  };

  const handleSubmit = () => {
    const requiredDocs = documents.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => doc.uploaded);

    if (uploadedRequired.length < requiredDocs.length) {
      Alert.alert('Error', 'Por favor sube todos los documentos requeridos');
      return;
    }

    Alert.alert('Éxito', 'Documentos enviados para revisión');
  };

  const allRequiredUploaded = documents
    .filter(doc => doc.required)
    .every(doc => doc.uploaded);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Subir Documentos</Text>
        <Text style={styles.subtitle}>
          Sube los documentos requeridos para completar tu verificación
        </Text>

        <View style={styles.documentsList}>
          {documents.map((document) => (
            <View key={document.id} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>
                  {document.name}
                  {document.required && <Text style={styles.required}> *</Text>}
                </Text>
                <Text style={styles.documentStatus}>
                  {document.uploaded ? '✅ Subido' : '⏳ Pendiente'}
                </Text>
              </View>

              {document.uploaded && document.uri && (
                <Image source={{ uri: document.uri }} style={styles.documentPreview} />
              )}

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  document.uploaded && styles.uploadButtonUploaded
                ]}
                onPress={() => handleDocumentUpload(document.id)}
              >
                <Text style={[
                  styles.uploadButtonText,
                  document.uploaded && styles.uploadButtonTextUploaded
                ]}>
                  {document.uploaded ? 'Cambiar' : 'Subir'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !allRequiredUploaded && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!allRequiredUploaded}
        >
          <Text style={styles.submitButtonText}>
            Enviar Documentos
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Consejos para subir documentos:</Text>
          <Text style={styles.infoText}>
            • Asegúrate de que la imagen sea clara y legible{'\n'}
            • Evita reflejos y sombras{'\n'}
            • Incluye todo el documento en la foto{'\n'}
            • Los documentos deben estar vigentes
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
  documentsList: {
    marginBottom: 30,
  },
  documentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  required: {
    color: '#dc3545',
  },
  documentStatus: {
    fontSize: 14,
    color: '#666',
  },
  documentPreview: {
    width: 100,
    height: 60,
    borderRadius: 4,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  uploadButtonUploaded: {
    backgroundColor: '#28a745',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadButtonTextUploaded: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
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

export default DocumentUploadScreen;