import { db, Transaction } from './database';
import { v4 as uuidv4 } from 'uuid';

export class TransactionModel {
  static async create(
    userId: string,
    type: 'income' | 'expense',
    amount: number,
    category: string,
    description: string,
    isAutomatic: boolean = false,
    automaticRuleId?: string
  ): Promise<Transaction> {
    await db.read();
    const newTransaction: Transaction = {
      id: uuidv4(),
      userId,
      type,
      amount,
      category,
      description,
      date: new Date().toISOString(),
      isAutomatic,
      automaticRuleId
    };
    db.data.transactions.push(newTransaction);
    await db.write();
    return newTransaction;
  }

  static async findByUserId(userId: string): Promise<Transaction[]> {
    await db.read();
    return db.data.transactions.filter(t => t.userId === userId);
  }

  static async findById(id: string): Promise<Transaction | undefined> {
    await db.read();
    return db.data.transactions.find(t => t.id === id);
  }

  static async delete(id: string): Promise<boolean> {
    await db.read();
    const index = db.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      db.data.transactions.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }

  static async getUserBalance(userId: string): Promise<{ income: number; expense: number; balance: number }> {
    await db.read();
    const userTransactions = db.data.transactions.filter(t => t.userId === userId);
    const income = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }
}