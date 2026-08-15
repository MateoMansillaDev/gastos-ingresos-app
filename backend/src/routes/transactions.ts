import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createTransaction, getTransactions, deleteTransaction, getBalance } from '../controllers/transactionController';

const router = Router();

router.post('/', authenticate, createTransaction);
router.get('/', authenticate, getTransactions);
router.get('/balance', authenticate, getBalance);
router.delete('/:id', authenticate, deleteTransaction);

export default router;