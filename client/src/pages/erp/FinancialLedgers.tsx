import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FinancialRecord } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';

export const FinancialLedgers: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('SALES');
  const [amount, setAmount] = useState<number>(10000);
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.get<FinancialRecord[]>('/erp/financials');
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/erp/financials', {
        type,
        category,
        amount,
        description,
        referenceNumber,
      });

      setShowAddModal(false);
      setDescription('');
      setReferenceNumber('');
      await fetchRecords();
    } catch (err: any) {
      alert(err.message || 'Failed to record transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);

  const netTreasury = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-blue-700" />
            Financial Records & Treasury Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready cooperative bookkeeping, income entries, operational disbursements, and net treasury balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Record Transaction
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-600" />
            Gross Inflows
          </span>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            ₹{totalIncome.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Sales, subscriptions, share deposits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1 text-rose-600" />
            Disbursements & Expenses
          </span>
          <p className="mt-2 text-2xl font-black text-rose-600">
            ₹{totalExpense.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Procurement, operations, logistics</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-blue-700" />
            Net Treasury Reserves
          </span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            ₹{netTreasury.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-teal-600 font-semibold">Audited positive balance</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Reference #</th>
                <th className="px-6 py-3.5">Recorded By</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Loading financial records...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === 'INCOME'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.type === 'INCOME' ? '+ INCOME' : '- EXPENSE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {r.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {r.category}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-extrabold ${
                        r.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {r.type === 'INCOME' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                      {r.referenceNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {r.recordedByUser?.fullName || 'Finance Lead'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(r.transactionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Record Financial Transaction</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter formal ledger entry. Protected by role-based auditing rules.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="INCOME">Income (Inflow)</option>
                    <option value="EXPENSE">Expense (Disbursement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="SALES">Produce Bulk Sales</option>
                    <option value="MEMBERSHIP_FEE">Membership Subscriptions</option>
                    <option value="EQUIPMENT">Equipment & IoT Hardware</option>
                    <option value="OPERATIONS">Operations & Logistics</option>
                    <option value="GRANTS">Government / NABARD Grants</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (INR ₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Bulk sale of organic grapes"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Voucher / Invoice Number</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-092"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  {submitting ? 'Recording...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
