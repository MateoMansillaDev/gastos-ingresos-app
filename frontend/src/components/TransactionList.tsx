import { Transaction } from '../types';
import { transactionsAPI } from '../services/api';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
}

export default function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      try {
        await transactionsAPI.delete(id);
        onTransactionDeleted();
      } catch (error) {
        console.error('Error deleting transaction:', error);
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

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <span className="text-xl text-primary-600">📋</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Historial de Transacciones</h2>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <p>No hay transacciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{transaction.category}</div>
                <div className="text-sm text-gray-600 mt-1">{transaction.description}</div>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>{formatDate(transaction.date)}</span>
                  {transaction.isAutomatic && (
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                      Automático
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(transaction.id)}
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