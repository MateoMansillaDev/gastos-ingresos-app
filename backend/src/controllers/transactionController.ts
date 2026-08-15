import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TransactionModel } from '../models/Transaction';

export async function createTransaction(req: AuthRequest, res: Response) {
  try {
    const { type, amount, category, description } = req.body;
    const userId = req.userId!;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const transaction = await TransactionModel.create(
      userId,
      type as 'income' | 'expense',
      amount,
      category,
      description || ''
    );

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const transactions = await TransactionModel.findByUserId(userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteTransaction(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    
    const transactionId = Array.isArray(id) ? id[0] : id;
    const transaction = await TransactionModel.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await TransactionModel.delete(transactionId);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBalance(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const balance = await TransactionModel.getUserBalance(userId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}