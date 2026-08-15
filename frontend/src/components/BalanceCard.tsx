import { Balance } from '../types';

interface BalanceCardProps {
  balance: Balance;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card bg-gradient-to-br from-success-50 to-success-100 border-2 border-success-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-success-700 text-sm font-semibold uppercase tracking-wide">Ingresos Totales</h3>
            <p className="text-3xl font-bold text-success-800 mt-2">
              ${balance.income.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 bg-success-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
        </div>
      </div>
      
      <div className="card bg-gradient-to-br from-danger-50 to-danger-100 border-2 border-danger-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-danger-700 text-sm font-semibold uppercase tracking-wide">Gastos Totales</h3>
            <p className="text-3xl font-bold text-danger-800 mt-2">
              ${balance.expense.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 bg-danger-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">📉</span>
          </div>
        </div>
      </div>
      
      <div className={`card bg-gradient-to-br ${balance.balance >= 0 ? 'from-primary-50 to-primary-100 border-2 border-primary-200' : 'from-danger-50 to-danger-100 border-2 border-danger-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${balance.balance >= 0 ? 'text-primary-700' : 'text-danger-700'} text-sm font-semibold uppercase tracking-wide`}>
              Balance
            </h3>
            <p
              className={`text-3xl font-bold mt-2 ${
                balance.balance >= 0 ? 'text-primary-800' : 'text-danger-800'
              }`}
            >
              ${balance.balance.toFixed(2)}
            </p>
          </div>
          <div className={`w-12 h-12 ${balance.balance >= 0 ? 'bg-primary-200' : 'bg-danger-200'} rounded-full flex items-center justify-center`}>
            <span className="text-2xl">{balance.balance >= 0 ? '💰' : '⚠️'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}