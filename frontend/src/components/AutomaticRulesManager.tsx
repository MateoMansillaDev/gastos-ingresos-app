import React, { useState } from 'react';
import { AutomaticRule } from '../types';
import { automaticRulesAPI } from '../services/api';

interface AutomaticRulesManagerProps {
  rules: AutomaticRule[];
  onRuleAdded: () => void;
  onRuleDeleted: () => void;
  onExecuteRules: () => void;
}

export default function AutomaticRulesManager({
  rules,
  onRuleAdded,
  onRuleDeleted,
  onExecuteRules
}: AutomaticRulesManagerProps) {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data: any = {
        type,
        amount: parseFloat(amount),
        category,
        description,
        frequency
      };

      if (frequency === 'weekly') {
        data.dayOfWeek = parseInt(dayOfWeek);
      } else {
        data.dayOfMonth = parseInt(dayOfMonth);
      }

      await automaticRulesAPI.create(data);
      setAmount('');
      setCategory('');
      setDescription('');
      setDayOfWeek('');
      setDayOfMonth('');
      setShowForm(false);
      onRuleAdded();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta regla automática?')) {
      try {
        await automaticRulesAPI.delete(id);
        onRuleDeleted();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day];
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-xl text-primary-600">⚙️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Reglas Automáticas</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancelar' : 'Nueva Regla'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-gray-700 font-medium mb-2">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                className="input-select"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
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
                placeholder="Ej: Salario, Alquiler"
                required
              />
            </div>
            {frequency === 'weekly' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Día de la semana</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="input-select"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
              </div>
            )}
            {frequency === 'monthly' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Día del mes</label>
                <input
                  type="number"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="input-field"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  required
                />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Detalles adicionales (opcional)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-success w-full mt-6"
          >
            Crear Regla
          </button>
        </form>
      )}

      <div className="mb-6">
        <button
          onClick={onExecuteRules}
          className="btn-primary w-full bg-gradient-to-r from-primary-600 to-primary-700"
        >
          ⚡ Ejecutar Reglas Pendientes
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🤖</div>
          <p>No hay reglas automáticas configuradas</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {rule.category} ({rule.type === 'income' ? 'Ingreso' : 'Gasto'})
                </div>
                <div className="text-sm text-gray-600 mt-1">{rule.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {rule.frequency === 'weekly'
                    ? `Cada ${getDayName(rule.dayOfWeek!)}`
                    : `El día ${rule.dayOfMonth} de cada mes`}
                </div>
                <div className="text-xs text-primary-600 mt-1">
                  Próxima ejecución: {formatDate(rule.nextExecution)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold text-lg ${
                    rule.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  ${rule.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-danger-100 text-danger-600 hover:bg-danger-200 transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}