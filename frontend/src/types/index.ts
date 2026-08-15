export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  isAutomatic: boolean;
  automaticRuleId?: string;
}

export interface AutomaticRule {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  startDate: string;
  nextExecution: string;
  isActive: boolean;
}

export interface Balance {
  income: number;
  expense: number;
  balance: number;
}