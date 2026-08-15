import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createAutomaticRule, getAutomaticRules, updateAutomaticRule, deleteAutomaticRule, executeAutomaticRules } from '../controllers/automaticRuleController';

const router = Router();

router.post('/', authenticate, createAutomaticRule);
router.get('/', authenticate, getAutomaticRules);
router.put('/:id', authenticate, updateAutomaticRule);
router.delete('/:id', authenticate, deleteAutomaticRule);
router.post('/execute', authenticate, executeAutomaticRules);

export default router;