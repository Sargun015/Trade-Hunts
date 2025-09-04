

import express from 'express';
import {
  createServiceRequest,
  getServiceRequestByUsers,
  updateServiceRequestStatus,
  markServiceRequestCompletion,
  getUserServiceRequests,
  updateServiceRequestTerms
} from '../controllers/ServiceRequest.controller.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Create a new service request
router.post('/', verifyToken, createServiceRequest);

// Get service request between two users
router.get('/conversation/:userId', verifyToken, getServiceRequestByUsers);

// Update service request status (accept, reject, cancel)
router.patch('/:requestId/status', verifyToken, updateServiceRequestStatus);

// Mark service request as completed by either party
router.patch('/:requestId/mark-completed', verifyToken, markServiceRequestCompletion);

// Get all service requests for current user
router.get('/', verifyToken, getUserServiceRequests);

// Update service request terms during negotiation
router.patch('/:requestId/terms', verifyToken, updateServiceRequestTerms);

export default router;