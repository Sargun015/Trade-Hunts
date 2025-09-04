import express from 'express';
import { 
  findMatches, 
  searchBySkill 
} from '../controllers/SkillMatching.controller.js';


import  verifyToken  from '../middleware/auth.js';

const router = express.Router();

router.get('/matches', verifyToken, findMatches);

router.get('/search', searchBySkill);

export default router;