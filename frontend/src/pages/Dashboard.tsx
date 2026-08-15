import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionsAPI, automaticRulesAPI } from '../services/api';
import { Transaction, AutomaticRule, Balance } from '../types';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import BalanceCard from '../components/BalanceCard';
import AutomaticRulesManager from '../components/AutomaticRulesManager';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [automaticRules, setAutomaticRules] = useState<AutomaticRule[]>([]);
  const [balance, setBalance] = useState<Balance>({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [transactionsRes, balanceRes, rulesRes] = await Promise.all([
        transactionsAPI.getAll(),
        transactionsAPI.getBalance(),
        automaticRulesAPI.getAll()
      ]);
      setTransactions(transactionsRes.data);
      setBalance(balanceRes.data);
      setAutomaticRules(rulesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransactionAdded = () => {
    fetchData();
  };

  const handleTransactionDeleted = () => {
    fetchData();
  };

  const handleRuleAdded = () => {
    fetchData();
  };

  const handleRuleDeleted = () => {
    fetchData();
  };

  const handleExecuteRules = async () => {
    try {
      await automaticRulesAPI.execute();
      fetchData();
    } catch (error) {
      console.error('Error executing rules:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">$</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Gestión de Finanzas</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Hola, {user?.username}</span>
            <button
              onClick={logout}
              className="btn-danger"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <BalanceCard balance={balance} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-8">
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
            <AutomaticRulesManager
              rules={automaticRules}
              onRuleAdded={handleRuleAdded}
              onRuleDeleted={handleRuleDeleted}
              onExecuteRules={handleExecuteRules}
            />
          </div>
          <div>
            <TransactionList
              transactions={transactions}
              onTransactionDeleted={handleTransactionDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}