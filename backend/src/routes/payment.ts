import { Router } from 'express';
import { createPayment, handleWebhook, getPaymentHistory, getSubscription } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPaymentSchema } from '../utils/validations';

const router = Router();

router.post('/create', authenticate, validate(createPaymentSchema), createPayment);
router.post('/webhook', handleWebhook);
router.get('/history', authenticate, getPaymentHistory);
router.get('/subscription', authenticate, getSubscription);

export default router;
