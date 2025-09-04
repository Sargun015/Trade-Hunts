// routes/Escrow.routes.js
import express from 'express';
import { 
  createEscrow,
  getEscrowByRequestId,
  confirmEscrow,
  disputeEscrow,
  cancelEscrow,
  getEscrowsByUserId,
  submitFeedback
} from '../controllers/Escrow.controller.js';
import  verifyToken  from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyToken, createEscrow);
router.get('/request/:requestId', verifyToken, getEscrowByRequestId);
router.post('/confirm/:escrowId', verifyToken, confirmEscrow);
router.post('/dispute/:escrowId', verifyToken, disputeEscrow);
router.post('/cancel/:escrowId', verifyToken, cancelEscrow);
router.get('/user', verifyToken, getEscrowsByUserId);
router.post('/feedback/:escrowId', verifyToken, submitFeedback);

export default router;