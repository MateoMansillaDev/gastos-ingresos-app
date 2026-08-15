import { db, AutomaticRule } from './database';
import { v4 as uuidv4 } from 'uuid';

export class AutomaticRuleModel {
  static async create(
    userId: string,
    type: 'income' | 'expense',
    amount: number,
    category: string,
    description: string,
    frequency: 'weekly' | 'monthly',
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Promise<AutomaticRule> {
    await db.read();
    const startDate = new Date();
    const nextExecution = this.calculateNextExecution(frequency, dayOfWeek, dayOfMonth, startDate);
    
    const newRule: AutomaticRule = {
      id: uuidv4(),
      userId,
      type,
      amount,
      category,
      description,
      frequency,
      dayOfWeek,
      dayOfMonth,
      startDate: startDate.toISOString(),
      nextExecution: nextExecution.toISOString(),
      isActive: true
    };
    db.data.automaticRules.push(newRule);
    await db.write();
    return newRule;
  }

  static async findByUserId(userId: string): Promise<AutomaticRule[]> {
    await db.read();
    return db.data.automaticRules.filter(r => r.userId === userId);
  }

  static async findById(id: string): Promise<AutomaticRule | undefined> {
    await db.read();
    return db.data.automaticRules.find(r => r.id === id);
  }

  static async update(id: string, updates: Partial<AutomaticRule>): Promise<AutomaticRule | undefined> {
    await db.read();
    const index = db.data.automaticRules.findIndex(r => r.id === id);
    if (index !== -1) {
      db.data.automaticRules[index] = { ...db.data.automaticRules[index], ...updates };
      await db.write();
      return db.data.automaticRules[index];
    }
    return undefined;
  }

  static async delete(id: string): Promise<boolean> {
    await db.read();
    const index = db.data.automaticRules.findIndex(r => r.id === id);
    if (index !== -1) {
      db.data.automaticRules.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }

  static async updateNextExecution(id: string): Promise<AutomaticRule | undefined> {
    await db.read();
    const rule = db.data.automaticRules.find(r => r.id === id);
    if (rule && rule.isActive) {
      const nextExecution = this.calculateNextExecution(
        rule.frequency,
        rule.dayOfWeek,
        rule.dayOfMonth,
        new Date(rule.nextExecution)
      );
      rule.nextExecution = nextExecution.toISOString();
      await db.write();
      return rule;
    }
    return undefined;
  }

  static async getDueRules(): Promise<AutomaticRule[]> {
    await db.read();
    const now = new Date();
    return db.data.automaticRules.filter(
      r => r.isActive && new Date(r.nextExecution) <= now
    );
  }

  private static calculateNextExecution(
    frequency: 'weekly' | 'monthly',
    dayOfWeek: number | undefined,
    dayOfMonth: number | undefined,
    fromDate: Date
  ): Date {
    const nextDate = new Date(fromDate);
    
    if (frequency === 'weekly' && dayOfWeek !== undefined) {
      // Move to next occurrence of the specified day of week
      const currentDay = nextDate.getDay();
      const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
      if (daysUntilNext === 0) {
        nextDate.setDate(nextDate.getDate() + 7); // Same day, move to next week
      } else {
        nextDate.setDate(nextDate.getDate() + daysUntilNext);
      }
    } else if (frequency === 'monthly' && dayOfMonth !== undefined) {
      // Move to next occurrence of the specified day of month
      const currentDay = nextDate.getDate();
      if (dayOfMonth > currentDay) {
        nextDate.setDate(dayOfMonth);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
      }
    }
    
    return nextDate;
  }
}