import { Router } from 'express';
import { TripController } from '../controllers/TripController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const tripController = new TripController();

// Public routes
router.get('/search', tripController.searchTrips.bind(tripController));
router.get('/advanced-search', tripController.searchTripsAdvanced.bind(tripController));
router.get('/search/suggestions', tripController.getSearchSuggestions.bind(tripController));
router.get('/popular-routes', tripController.getPopularRoutes.bind(tripController));
router.get('/:id', tripController.getTripById.bind(tripController));

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/', tripController.createTrip.bind(tripController));
router.put('/:id', tripController.updateTrip.bind(tripController));
router.delete('/:id', tripController.deleteTrip.bind(tripController));
router.get('/my-trips', tripController.getMyTrips.bind(tripController));

export default router;