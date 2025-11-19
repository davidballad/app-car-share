// Ecuador-specific constants and data

export const ECUADOR_CITIES = [
  'Quito',
  'Guayaquil',
  'Cuenca',
  'Santo Domingo',
  'Machala',
  'Durán',
  'Manta',
  'Portoviejo',
  'Loja',
  'Ambato',
  'Esmeraldas',
  'Quevedo',
  'Riobamba',
  'Milagro',
  'Ibarra',
  'La Libertad',
  'Babahoyo',
  'Sangolquí',
  'Otavalo',
  'Latacunga',
  'Tulcán',
  'Pasaje',
  'Chone',
  'El Carmen',
  'Guaranda',
  'Azogues',
  'Macas',
  'Nueva Loja',
  'Zamora',
  'Tena',
  'Puyo',
  'Santa Elena',
  'Salinas',
  'Atacames',
  'Bahía de Caráquez',
  'Jipijapa',
  'Montecristi',
  'Vinces',
  'Ventanas',
  'Cañar',
  'Gualaceo',
  'Paute',
  'Girón',
  'Santa Rosa',
  'Huaquillas',
  'Arenillas',
  'Piñas',
  'Zaruma',
  'Catamayo',
  'Cariamanga',
  'Gonzanamá',
  'Macará',
  'Catacocha',
  'Alamor',
  'Celica',
  'Pindal',
  'Puyango',
  'Sozoranga',
  'Zapotillo',
];

export const ECUADOR_PROVINCES = [
  'Azuay',
  'Bolívar',
  'Cañar',
  'Carchi',
  'Chimborazo',
  'Cotopaxi',
  'El Oro',
  'Esmeraldas',
  'Galápagos',
  'Guayas',
  'Imbabura',
  'Loja',
  'Los Ríos',
  'Manabí',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Pichincha',
  'Santa Elena',
  'Santo Domingo de los Tsáchilas',
  'Sucumbíos',
  'Tungurahua',
  'Zamora Chinchipe',
];

// Popular inter-city routes in Ecuador
export const POPULAR_ROUTES = [
  { from: 'Quito', to: 'Guayaquil', duration: '8 horas', distance: '420 km' },
  { from: 'Quito', to: 'Cuenca', duration: '6 horas', distance: '340 km' },
  { from: 'Guayaquil', to: 'Cuenca', duration: '4 horas', distance: '190 km' },
  { from: 'Quito', to: 'Manta', duration: '6 horas', distance: '350 km' },
  { from: 'Quito', to: 'Loja', duration: '8 horas', distance: '450 km' },
  { from: 'Guayaquil', to: 'Manta', duration: '3 horas', distance: '170 km' },
  { from: 'Quito', to: 'Ambato', duration: '2 horas', distance: '120 km' },
  { from: 'Quito', to: 'Riobamba', duration: '3 horas', distance: '180 km' },
  { from: 'Guayaquil', to: 'Machala', duration: '2 horas', distance: '100 km' },
  { from: 'Cuenca', to: 'Loja', duration: '3 horas', distance: '150 km' },
];

// Ecuador phone number validation
export const ECUADOR_PHONE_REGEX = /^(\+593|0)[2-9]\d{7,8}$/;

// Ecuador ID (Cédula) validation
export const ECUADOR_CEDULA_REGEX = /^\d{10}$/;

// Currency formatting for Ecuador (USD)
export const formatEcuadorCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Date formatting for Ecuador
export const formatEcuadorDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatEcuadorTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

// Common Spanish phrases for the app
export const SPANISH_PHRASES = {
  welcome: 'Bienvenido',
  search: 'Buscar',
  book: 'Reservar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
  noResults: 'No se encontraron resultados',
  tryAgain: 'Intentar de nuevo',
  departure: 'Salida',
  arrival: 'Llegada',
  driver: 'Conductor',
  passenger: 'Pasajero',
  trip: 'Viaje',
  booking: 'Reserva',
  profile: 'Perfil',
  messages: 'Mensajes',
  notifications: 'Notificaciones',
  settings: 'Configuración',
  logout: 'Cerrar sesión',
  login: 'Iniciar sesión',
  register: 'Registrarse',
  verified: 'Verificado',
  unverified: 'No verificado',
  rating: 'Calificación',
  reviews: 'Reseñas',
  price: 'Precio',
  seats: 'Asientos',
  available: 'Disponible',
  unavailable: 'No disponible',
  completed: 'Completado',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
  // Background check related
  backgroundCheck: 'Verificación de Antecedentes',
  cedula: 'Cédula de Identidad',
  passport: 'Pasaporte',
  documentNumber: 'Número de Documento',
  verifyBackground: 'Verificar Antecedentes',
  backgroundVerified: 'Antecedentes Verificados',
  backgroundPending: 'Verificación Pendiente',
  backgroundExpired: 'Verificación Vencida',
  renewVerification: 'Renovar Verificación',
  expiresIn: 'Vence en',
  days: 'días',
  expired: 'Vencido',
};