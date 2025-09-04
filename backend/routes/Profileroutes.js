import express from 'express';


import {
  createOrUpdateProfile,
  getCurrentUserProfile,
  getProfileByUserId,
  deletePortfolioItem,
} from '../controllers/Profile.controller.js';


import  verifyToken  from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createOrUpdateProfile);

router.get('/me', verifyToken, getCurrentUserProfile);

router.get('/:userId', verifyToken, getProfileByUserId);

router.delete('/portfolio/:itemId', verifyToken, deletePortfolioItem);

export default router;