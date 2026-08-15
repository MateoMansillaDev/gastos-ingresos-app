import React, { useState } from 'react';
import { transactionsAPI } from '../services/api';

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

export default function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await transactionsAPI.create({
        type,
        amount: parseFloat(amount),
        category,
        description
      });
      setAmount('');
      setCategory('');
      setDescription('');
      onTransactionAdded();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating transaction');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'income' ? 'bg-success-100' : 'bg-danger-100'}`}>
          <span className={`text-xl ${type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
            {type === 'income' ? '↑' : '↓'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Agregar Transacción</h2>
      </div>
      
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="input-select"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-8"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
            placeholder="Ej: Alimentación, Transporte, Salario"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Detalles adicionales (opcional)"
          />
        </div>
        
        <button
          type="submit"
          className={`w-full ${type === 'income' ? 'btn-success' : 'btn-danger'}`}
        >
          {type === 'income' ? 'Agregar Ingreso' : 'Agregar Gasto'}
        </button>
      </form>
    </div>
  );
}