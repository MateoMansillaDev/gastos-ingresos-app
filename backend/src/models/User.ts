import { db, User } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async create(username: string, email: string, password: string): Promise<User> {
    await db.read();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    db.data.users.push(newUser);
    await db.write();
    return newUser;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    await db.read();
    return db.data.users.find(user => user.email === email);
  }

  static async findById(id: string): Promise<User | undefined> {
    await db.read();
    return db.data.users.find(user => user.id === id);
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}