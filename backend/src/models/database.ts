import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

interface Transaction {
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

interface AutomaticRule {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  startDate: string;
  nextExecution: string;
  isActive: boolean;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  automaticRules: AutomaticRule[];
}

// Use app data directory for Electron, local directory for development
const isElectron = process.versions && process.versions.electron;
const appDataPath = process.env.APPDATA || process.env.HOME || process.env.LOCALAPPDATA || __dirname;
const dbDir = isElectron 
  ? path.join(appDataPath, 'GestionFinanzas', 'data')
  : path.join(__dirname, '../../data');
const dbFile = path.join(dbDir, 'db.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new JSONFile<DatabaseSchema>(dbFile);
const defaultData: DatabaseSchema = {
  users: [],
  transactions: [],
  automaticRules: []
};

const db = new Low<DatabaseSchema>(adapter, defaultData);

export async function initializeDatabase() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
}

export { db, User, Transaction, AutomaticRule, DatabaseSchema };