import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AutomaticRuleModel } from '../models/AutomaticRule';
import { TransactionModel } from '../models/Transaction';

export async function createAutomaticRule(req: AuthRequest, res: Response) {
  try {
    const { type, amount, category, description, frequency, dayOfWeek, dayOfMonth } = req.body;
    const userId = req.userId!;

    if (!type || !amount || !category || !frequency) {
      return res.status(400).json({ error: 'Type, amount, category, and frequency are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    if (frequency === 'weekly' && dayOfWeek === undefined) {
      return res.status(400).json({ error: 'dayOfWeek is required for weekly frequency' });
    }

    if (frequency === 'monthly' && dayOfMonth === undefined) {
      return res.status(400).json({ error: 'dayOfMonth is required for monthly frequency' });
    }

    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return res.status(400).json({ error: 'dayOfWeek must be between 0 and 6' });
    }

    if (dayOfMonth !== undefined && (dayOfMonth < 1 || dayOfMonth > 31)) {
      return res.status(400).json({ error: 'dayOfMonth must be between 1 and 31' });
    }

    const rule = await AutomaticRuleModel.create(
      userId,
      type as 'income' | 'expense',
      amount,
      category,
      description || '',
      frequency as 'weekly' | 'monthly',
      dayOfWeek,
      dayOfMonth
    );

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAutomaticRules(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const rules = await AutomaticRuleModel.findByUserId(userId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAutomaticRule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updates = req.body;

    const ruleId = Array.isArray(id) ? id[0] : id;
    const rule = await AutomaticRuleModel.findById(ruleId);
    if (!rule || rule.userId !== userId) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const updatedRule = await AutomaticRuleModel.update(ruleId, updates);
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAutomaticRule(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    
    const ruleId = Array.isArray(id) ? id[0] : id;
    const rule = await AutomaticRuleModel.findById(ruleId);
    if (!rule || rule.userId !== userId) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await AutomaticRuleModel.delete(ruleId);
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function executeAutomaticRules(req: AuthRequest, res: Response) {
  try {
    const dueRules = await AutomaticRuleModel.getDueRules();
    const executedTransactions = [];

    for (const rule of dueRules) {
      const transaction = await TransactionModel.create(
        rule.userId,
        rule.type as 'income' | 'expense',
        rule.amount,
        rule.category,
        rule.description,
        true,
        rule.id
      );
      executedTransactions.push(transaction);
      await AutomaticRuleModel.updateNextExecution(rule.id);
    }

    res.json({
      message: `Executed ${executedTransactions.length} automatic transactions`,
      transactions: executedTransactions
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}