import express from 'express';
import { 
  register, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword, 
  getCurrentUser,
  updateUser
} from '../controllers/User.controller.js';
import  verifyToken  from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);

router.post('/verify-email', verifyEmail);


router.post('/login', login);

router.post('/forgot-password', forgotPassword);


router.post('/reset-password', resetPassword);

router.get('/me', verifyToken, getCurrentUser);

router.put('/update', verifyToken, updateUser);



export default router;