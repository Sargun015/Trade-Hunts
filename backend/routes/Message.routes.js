import express from 'express';
import verifyToken from '../middleware/auth.js';
import { getAllConversations,getConversation } from '../controllers/Message.controller.js';

const router = express.Router();

router.get('/conversations', verifyToken, getAllConversations);

router.get('/conversation/:userId', verifyToken, getConversation);

export default router;