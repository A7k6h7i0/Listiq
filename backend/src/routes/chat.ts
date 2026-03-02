import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  getUnreadCount,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validate';
import { createMessageSchema, uuidSchema } from '../utils/validations';

const router = Router();

router.get('/', authenticate, getConversations);
router.get('/unread', authenticate, getUnreadCount);
router.get('/:id', authenticate, validateParams(uuidSchema), getConversation);
router.post('/', authenticate, createConversation);
router.post('/message', authenticate, validate(createMessageSchema), sendMessage);

export default router;
