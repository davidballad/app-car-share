import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const bookingController = new BookingController();

// All booking routes require authentication
router.use(authenticateToken);

// Booking management routes
router.post('/', bookingController.createBooking.bind(bookingController));
router.get('/my-bookings', bookingController.getMyBookings.bind(bookingController));
router.get('/trip/:tripId', bookingController.getTripBookings.bind(bookingController));
router.get('/:id', bookingController.getBookingById.bind(bookingController));
router.get('/:id/whatsapp-contact', bookingController.getWhatsAppContact.bind(bookingController));
router.put('/:id', bookingController.updateBooking.bind(bookingController));
router.delete('/:id', bookingController.cancelBooking.bind(bookingController));

export default router;